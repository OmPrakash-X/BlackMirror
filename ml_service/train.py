#!/usr/bin/env python3
from pathlib import Path
from typing import  Optional

from flask import Flask, request, render_template, redirect, url_for, flash, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import numpy as np
import joblib
import torch
import albumentations as A
from albumentations.pytorch import ToTensorV2

# Import your DetectorModel from train_fast_faulty if available
try:
    # prefer the file you supplied in conversation
    from train_fast_faulty import DetectorModel
except Exception:
    # fallback: try 'train' (older filename used in some posts)
    try:
        from train import DetectorModel
    except Exception:
        DetectorModel = None

# Configuration
BASE_DIR = Path(__file__).resolve().parent
UPLOADS = BASE_DIR / "uploads"
UPLOADS.mkdir(exist_ok=True)
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".bmp"}

# model/calib defaults (adjust if your files are in different paths)
MODEL_PATH = str(BASE_DIR / "outputs" / "best_model.pth")
CALIB_PATH = str(BASE_DIR / "outputs" / "calibrator.joblib")
IMG_SIZE = 128  # must match training img_size

app = Flask(__name__)
app.secret_key = "replace-with-a-secure-random-string"
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB upload

def allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXT

# ----------------- Helpers: model load & preprocess -----------------
def load_model_and_ckpt(model_path: str, device: Optional[torch.device] = None, model_name: str = "efficientnet_b0", img_size: int = IMG_SIZE):
    """
    Loads the checkpoint and returns (model, ckpt_args)
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if hasattr(torch.backends, "mps") and torch.backends.mps.is_available() else "cpu"))
    if not Path(model_path).exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    ckpt = torch.load(model_path, map_location=device)
    # If DetectorModel class isn't available from imports, attempt to import local training file
    if DetectorModel is None:
        raise RuntimeError("DetectorModel class not found. Ensure train_fast_faulty.py (or train.py) is importable.")
    model = DetectorModel(backbone_name=model_name, pretrained=False, img_size=img_size)
    # load state dict if key present, else try to load directly
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        state = ckpt["model_state_dict"]
    else:
        state = ckpt
    model.load_state_dict(state)
    model = model.to(device).eval()
    ckpt_args = {}
    if isinstance(ckpt, dict) and "args" in ckpt:
        ckpt_args = ckpt["args"]
    return model, ckpt_args, device

def load_calibrator(calib_path: str):
    if not Path(calib_path).exists():
        raise FileNotFoundError(f"Calibrator not found: {calib_path}")
    iso = joblib.load(calib_path)
    if not hasattr(iso, "predict"):
        raise RuntimeError("Loaded calibrator does not have `predict` method.")
    return iso

def center_crop_and_resize_pil(img: Image.Image, size: int) -> Image.Image:
    w,h = img.size
    m = min(w,h)
    left = (w - m)//2
    top = (h - m)//2
    imc = img.crop((left, top, left + m, top + m)).resize((size, size), Image.LANCZOS)
    return imc

def preprocess_image_for_model(image_path: str, img_size: int = IMG_SIZE, center_crop: bool = False):
    img = Image.open(image_path).convert("RGB")
    if center_crop:
        img = center_crop_and_resize_pil(img, img_size)
        img_arr = np.array(img)
        transform = A.Compose([A.Normalize(mean=(0.485,0.456,0.406), std=(0.229,0.224,0.225)), ToTensorV2()])
        t = transform(image=img_arr)["image"].unsqueeze(0)
    else:
        # resize then normalize
        transform = A.Compose([A.Resize(img_size, img_size), A.Normalize(mean=(0.485,0.456,0.406), std=(0.229,0.224,0.225)), ToTensorV2()])
        img_arr = np.array(img)
        t = transform(image=img_arr)["image"].unsqueeze(0)
    return t

def predict_with_debug(model, device, image_path: str, calibrator=None, img_size: int = IMG_SIZE, center_crop: bool = False):
    """
    Returns a dict with:
      - logit (float)
      - raw_prob (float)
      - calibrated (float or None)
      - percent (calibrated*100 or None)
    """
    t = preprocess_image_for_model(image_path, img_size=img_size, center_crop=center_crop).to(device)
    with torch.no_grad():
        logits = model(t)  # shape [1] or [1,]
        # ensure scalar
        if isinstance(logits, torch.Tensor):
            logit = float(logits.cpu().numpy().ravel()[0])
        else:
            logit = float(logits)
        raw_prob = float(torch.sigmoid(torch.tensor(logit)).numpy().ravel()[0])
    calibrated = None
    percent = None
    if calibrator is not None:
        try:
            calibrated = float(calibrator.predict([raw_prob])[0])
            percent = float(calibrated * 100.0)
        except Exception:
            calibrated = None
            percent = None
    return {"logit": logit, "raw_prob": raw_prob, "calibrated": calibrated, "percent": percent}

# Cache loaded model & calibrator to avoid reload per request
_global = {"model": None, "device": None, "ckpt_args": None, "calibrator": None, "model_path": None, "calib_path": None, "model_name": "efficientnet_b0", "img_size": IMG_SIZE}

def ensure_model_loaded(model_path=MODEL_PATH, calib_path=CALIB_PATH, model_name="efficientnet_b0", img_size=IMG_SIZE):
    if _global["model"] is None or _global["model_path"] != str(model_path) or _global["model_name"] != model_name or _global["img_size"] != img_size:
        model, ckpt_args, device = load_model_and_ckpt(model_path, model_name=model_name, img_size=img_size)
        _global["model"] = model
        _global["device"] = device
        _global["ckpt_args"] = ckpt_args
        _global["model_path"] = str(model_path)
        _global["model_name"] = model_name
        _global["img_size"] = img_size
    # calibrator optional: load if present and not loaded
    if _global["calibrator"] is None and Path(calib_path).exists():
        try:
            _global["calibrator"] = load_calibrator(calib_path)
            _global["calib_path"] = str(calib_path)
        except Exception:
            _global["calibrator"] = None
    return _global["model"], _global["device"], _global["ckpt_args"], _global["calibrator"]

# ----------------- Flask routes -----------------
@app.route("/", methods=["GET"])
def home():
    # render template with no result initially
    return render_template("home.html", result=None)

@app.route("/predict", methods=["POST"])
def predict():
    # form fields: image file, use_calib checkbox (optional), center_crop checkbox (optional)
    if "image" not in request.files:
        flash("No file part", "danger")
        return redirect(url_for("home"))
    file = request.files["image"]
    if file.filename == "":
        flash("No selected file", "danger")
        return redirect(url_for("home"))
    if not allowed_file(file.filename):
        flash("Unsupported file type", "danger")
        return redirect(url_for("home"))

    # optional flags from form
    use_calib = request.form.get("use_calib", "on") != "off"  # default True
    center_crop = request.form.get("center_crop", "off") == "on"

    filename = secure_filename(file.filename)
    save_path = UPLOADS / filename
    file.save(save_path)

    # ensure model & calibrator loaded
    try:
        model, device, ckpt_args, calibrator = ensure_model_loaded(MODEL_PATH, CALIB_PATH, model_name=_global["model_name"], img_size=_global["img_size"])
    except Exception as e:
        flash(f"Model load failed: {e}", "danger")
        return redirect(url_for("home"))

    # choose calibrator based on use_calib flag
    calib_to_use = calibrator if use_calib and calibrator is not None else None

    try:
        debug = predict_with_debug(model, device, str(save_path), calibrator=calib_to_use, img_size=_global["img_size"], center_crop=center_crop)
        result = {
            "filename": filename,
            "logit": debug["logit"],
            "raw_prob": debug["raw_prob"],
            "calibrated": debug["calibrated"],
            "percent": debug["percent"],
            "used_calibrator": calib_to_use is not None,
            "ckpt_args": ckpt_args or {},
            "center_crop": center_crop,
        }
        return render_template("home.html", result=result)
    except Exception as e:
        flash(f"Prediction failed: {e}", "danger")
        return redirect(url_for("home"))

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(str(UPLOADS), filename)

@app.route("/debug", methods=["GET"])
def debug_json():
    """
    JSON endpoint for quick checks:
      ?image=uploads/test.jpg&use_calib=0&center_crop=1
    """
    image = request.args.get("image")
    use_calib = request.args.get("use_calib", "1") != "0"
    center_crop = request.args.get("center_crop", "0") == "1"
    if not image:
        return jsonify({"ok": False, "error": "no image specified (use ?image=uploads/foo.jpg)"}), 400
    path = Path(image)
    if not path.is_absolute():
        path = BASE_DIR / image
    if not path.exists():
        return jsonify({"ok": False, "error": f"image not found: {path}"}), 404

    try:
        model, device, ckpt_args, calibrator = ensure_model_loaded(MODEL_PATH, CALIB_PATH, model_name=_global["model_name"], img_size=_global["img_size"])
    except Exception as e:
        return jsonify({"ok": False, "error": f"model load failed: {e}"}), 500

    calib_to_use = calibrator if use_calib and calibrator is not None else None
    try:
        debug = predict_with_debug(model, device, str(path), calibrator=calib_to_use, img_size=_global["img_size"], center_crop=center_crop)
        return jsonify({"ok": True, "image": str(path), "result": debug, "used_calibrator": calib_to_use is not None, "ckpt_args": ckpt_args})
    except Exception as e:
        return jsonify({"ok": False, "error": f"predict failed: {e}"}), 500

if __name__ == "__main__":
    # basic self-check
    missing = []
    if not Path(MODEL_PATH).exists():
        missing.append(MODEL_PATH)
    if not Path(CALIB_PATH).exists():
        # calibrator optional, warn only
        print("Warning: calibrator not found at", CALIB_PATH)
    if missing:
        print("Warning: missing files:", missing)
        print("Make sure model and calibrator exist at the paths above before predicting.")
    app.run(host="0.0.0.0", port=5080, debug=True)
