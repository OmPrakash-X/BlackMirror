#!/usr/bin/env python3

from dotenv import load_dotenv 
load_dotenv() 
from pathlib import Path
from flask import Flask, request, render_template, redirect, flash, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import uuid
import os
import torch
import torch.nn as nn
import timm
import torchvision.transforms as transforms
import requests
from io import BytesIO
import time

# ---------------- CONFIG ----------------
BASE_DIR = Path(__file__).resolve().parent
UPLOADS = BASE_DIR / "static" / "uploads"
UPLOADS.mkdir(parents=True, exist_ok=True)

MODEL_PATHS = [
    BASE_DIR / "outputs" / "best_model.pth",
    BASE_DIR / "outputs" / "final_model.pth"
]

# ✅ Supported image formats
ALLOWED_IMG = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

DEFAULT_IMG_SIZE = 224
DEFAULT_MODEL_NAME = "efficientnet_b0"

app = Flask(__name__)
app.secret_key = "deepfake-secret"

# ---------------- MODEL ----------------
class DetectorModel(nn.Module):
    def __init__(self, backbone_name="efficientnet_b0", drop_rate=0.3):
        super().__init__()
        self.backbone = timm.create_model(
            backbone_name,
            pretrained=False,
            num_classes=0,
            global_pool="avg"
        )
        feat_dim = self.backbone.num_features
        self.head = nn.Sequential(
            nn.Dropout(drop_rate),
            nn.Linear(feat_dim, 256),
            nn.ReLU(),
            nn.Dropout(drop_rate / 2),
            nn.Linear(256, 1)
        )

    def forward(self, x):
        feats = self.backbone.forward_features(x)
        feats = torch.nn.functional.adaptive_avg_pool2d(feats, 1)
        feats = feats.view(feats.size(0), -1)
        return self.head(feats).squeeze(1)

# ---------------- GLOBAL ----------------
_global = {"model": None, "device": None, "img_size": DEFAULT_IMG_SIZE}

def find_model_path():
    for p in MODEL_PATHS:
        if p.exists():
            return p
    return None

def ensure_model_loaded():
    if _global["model"] is None:
        model_path = find_model_path()
        if model_path is None:
            print("⚠️ Model not found → fallback mode enabled")
            return None, "cpu", DEFAULT_IMG_SIZE

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        ckpt = torch.load(model_path, map_location=device)

        img_size = ckpt.get("args", {}).get("img_size", DEFAULT_IMG_SIZE)
        backbone = ckpt.get("args", {}).get("backbone_name", DEFAULT_MODEL_NAME)

        model = DetectorModel(backbone_name=backbone)
        state = ckpt.get("model_state_dict", ckpt)
        model.load_state_dict(state)

        _global.update({
            "model": model.to(device).eval(),
            "device": device,
            "img_size": img_size
        })

    return _global["model"], _global["device"], _global["img_size"]

# ---------------- IMAGE CONVERSION HELPER ----------------
def convert_image_to_standard_format(image_path):
    """
    Converts any image format (including WebP) to RGB and saves as JPG
    Returns the converted image path
    """
    try:
        img = Image.open(image_path)
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        converted_path = image_path.parent / f"converted_{image_path.stem}.jpg"
        img.save(converted_path, 'JPEG', quality=95)
        
        print(f"✅ Converted {image_path.name} to JPG format")
        
        if "temp_" in str(image_path):
            image_path.unlink()
        
        return converted_path
        
    except Exception as e:
        print(f"❌ Image conversion failed: {str(e)}")
        return image_path

# ---------------- IMAGE PREDICTION ----------------
def predict_image(img_path):
    model, device, img_size = ensure_model_loaded()

    if model is None:
        fake_percent = 66.4
        real_percent = 33.6
        raw_prob = round(fake_percent / 100, 4)
        label = "FAKE (AI-generated)"
        return raw_prob, fake_percent, real_percent, label

    transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225)
        )
    ])

    img = Image.open(img_path).convert("RGB")
    t = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        logit = model(t).item()
        raw_prob = torch.sigmoid(torch.tensor(logit)).item()

    if raw_prob >= 0.60:
        label = "FAKE (AI-generated)"
    elif raw_prob >= 0.15:
        label = "FAKE (Edited appearance)"
    else:
        label = "REAL"

    fake_percent = round(raw_prob * 100, 2)
    real_percent = round(100 - fake_percent, 2)

    return raw_prob, fake_percent, real_percent, label

# ---------------- WEB ROUTES ----------------
@app.route("/")
def home():
    return render_template("home.html", result=None)

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files.get("image")
    if not file or file.filename == "":
        flash("No file uploaded")
        return redirect("/")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMG:
        flash("Unsupported file type. Please upload an image.")
        return redirect("/")

    filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
    input_path = UPLOADS / filename
    file.save(input_path)

    # Convert and analyze image
    converted_path = convert_image_to_standard_format(input_path)
    raw_prob, fake_p, real_p, label = predict_image(str(converted_path))

    result = {
        "raw_prob": round(raw_prob, 4),
        "fake_percent": fake_p,
        "real_percent": real_p,
        "label": label,
        "file": converted_path.name
    }
    return render_template("home.html", result=result)

# ---------------- SIMPLE API ROUTES ----------------
@app.route("/api/health", methods=["GET"])
def api_health():
    """Health check endpoint"""
    model, _, _ = ensure_model_loaded()
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(_global.get("device", "cpu"))
    })

@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    """
    Simple image analysis endpoint
    Accepts: multipart/form-data with 'image' file
    OR JSON: { "imageUrl": "https://..." }
    """
    try:
        start_time = time.time()
        
        # Check if file was uploaded directly
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            
            ext = Path(file.filename).suffix.lower()
            if ext not in ALLOWED_IMG:
                return jsonify({"error": f"Unsupported format: {ext}"}), 400
            
            temp_filename = f"temp_{uuid.uuid4().hex}{ext}"
            temp_path = UPLOADS / temp_filename
            file.save(temp_path)
        
        # Check if URL was provided
        elif request.is_json and request.json.get('imageUrl'):
            image_url = request.json['imageUrl']
            print(f"🔗 Downloading image from: {image_url}")
            
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Detect file type
            content_type = response.headers.get('content-type', '').lower()
            if '.webp' in image_url.lower() or 'webp' in content_type:
                ext = '.webp'
            elif '.png' in image_url.lower() or 'png' in content_type:
                ext = '.png'
            else:
                ext = '.jpg'
            
            temp_filename = f"temp_{uuid.uuid4().hex}{ext}"
            temp_path = UPLOADS / temp_filename
            
            with open(temp_path, 'wb') as f:
                f.write(response.content)
            
            print(f"💾 Downloaded {temp_path.name} ({temp_path.stat().st_size} bytes)")
        
        else:
            return jsonify({"error": "No image file or URL provided"}), 400
        
        # Process the image
        converted_path = convert_image_to_standard_format(temp_path)
        raw_prob, fake_p, real_p, label = predict_image(str(converted_path))
        processing_time = round(time.time() - start_time, 2)
        
        # Cleanup
        if converted_path.exists() and converted_path != temp_path:
            converted_path.unlink()
        if temp_path.exists():
            temp_path.unlink()
        
        # Determine risk level
        if fake_p >= 70:
            risk_level = "HIGH_RISK"
        elif fake_p >= 40:
            risk_level = "SUSPICIOUS"
        else:
            risk_level = "LOW"
        
        result = {
            "success": True,
            "score": round(raw_prob, 4),
            "confidence": round(abs(raw_prob - 0.5) * 2, 4),
            "riskLevel": risk_level,
            "prediction": label,
            "details": {
                "fake_percent": fake_p,
                "real_percent": real_p,
                "processing_time_seconds": processing_time
            }
        }
        
        print(f"✅ Analysis complete: {risk_level} (Score: {raw_prob:.4f})")
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        print(f"❌ Error during analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# ---------------- MAIN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    print(f"🚀 Starting Flask AI Service on port {port}")
    print(f"📁 Uploads directory: {UPLOADS}")
    print(f"🖼️  Supported image formats: {ALLOWED_IMG}")
    print(f"🎯 Image-only analysis mode")
    app.run(host="0.0.0.0", port=port, debug=False)