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
import time
import traceback

# Import video predictor (if available in the same directory)
try:
    from video_predictor import run_advanced_video_prediction
except ImportError:
    run_advanced_video_prediction = None

# Import audio predictor
try:
    from audio_predictor import predict_audio, load_audio_model
    # Pre-load audio model at startup (non-blocking — fails gracefully)
    load_audio_model()
except ImportError:
    predict_audio = None
    print("⚠️  audio_predictor not found — audio detection disabled.")

# ---------------- CONFIG ----------------
BASE_DIR = Path(__file__).resolve().parent
UPLOADS = BASE_DIR / "static" / "uploads"
UPLOADS.mkdir(parents=True, exist_ok=True)

MODEL_PATHS = [
    BASE_DIR / "outputs" / "best_model.pth",
    BASE_DIR / "outputs" / "final_model.pth"
]

# Supported formats
ALLOWED_IMG = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
ALLOWED_VIDEO = {".mp4", ".avi", ".mov", ".mkv"}

DEFAULT_IMG_SIZE = 224
DEFAULT_MODEL_NAME = "efficientnet_b0"

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "deepfake-secret")

# ---------------- MODEL ARCHITECTURE ----------------
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

# ---------------- GLOBAL STATE ----------------
_global = {"model": None, "device": None, "img_size": DEFAULT_IMG_SIZE}

def ensure_model_loaded():
    if _global["model"] is None:
        model_path = next((p for p in MODEL_PATHS if p.exists()), None)
        if model_path is None:
            print("⚠️ Model failure: No model weights found.")
            return None, "cpu", DEFAULT_IMG_SIZE

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            ckpt = torch.load(model_path, map_location=device)
            img_size = ckpt.get("args", {}).get("img_size", DEFAULT_IMG_SIZE)
            backbone = ckpt.get("args", {}).get("backbone_name", DEFAULT_MODEL_NAME)

            model = DetectorModel(backbone_name=backbone)
            
            # SAFE LOAD: Handle strict vs non-strict loading if keys differ
            state_dict = ckpt.get("model_state_dict", ckpt)
            model.load_state_dict(state_dict, strict=False)

            _global.update({
                "model": model.to(device).eval(),
                "device": device,
                "img_size": img_size
            })
            print(f"✅ Model loaded from {model_path} (Backbone: {backbone})")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            return None, "cpu", DEFAULT_IMG_SIZE

    return _global["model"], _global["device"], _global["img_size"]

# ---------------- UTILS ----------------
def convert_image_to_standard_format(image_path):
    """Ensure image is RGB JPEG"""
    try:
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        converted_path = image_path.parent / f"converted_{image_path.stem}.jpg"
        img.save(converted_path, 'JPEG', quality=95)
        
        if "temp_" in str(image_path):
            try: os.remove(image_path)
            except: pass
        
        return converted_path
    except Exception as e:
        print(f"❌ Image conversion failed: {str(e)}")
        return image_path

# ---------------- PREDICTION LOGIC ----------------
def predict_image(img_path):
    model, device, img_size = ensure_model_loaded()

    if model is None:
        raise RuntimeError("AI Model not available")

    transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225)
        )
    ])

    try:
        img = Image.open(img_path).convert("RGB")
        t = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            logit = model(t).item()
            raw_prob = torch.sigmoid(torch.tensor(logit)).item()

        # Classification Thresholds
        if raw_prob >= 0.60:
            label = "FAKE (AI-generated)"
        elif raw_prob >= 0.40:  # Adjusted threshold for uncertainty
            label = "SUSPICIOUS"
        else:
            label = "REAL"

        fake_percent = round(raw_prob * 100, 2)
        real_percent = round(100 - fake_percent, 2)

        return raw_prob, fake_percent, real_percent, label

    except Exception as e:
        print(f"prediction error: {e}")
        raise e

# ---------------- ROUTES ----------------
@app.route("/")
def home():
    return render_template("home.html", result=None)

@app.route("/predict", methods=["POST"])
def predict():
    """Handle browser-based uploads"""
    file = request.files.get("image")
    if not file or file.filename == "":
        flash("No file uploaded")
        return redirect("/")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMG and ext not in ALLOWED_VIDEO:
        flash("Unsupported file type")
        return redirect("/")

    filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
    input_path = UPLOADS / filename
    file.save(input_path)

    try:
        if ext in ALLOWED_IMG:
            converted_path = convert_image_to_standard_format(input_path)
            raw_prob, fake_p, real_p, label = predict_image(str(converted_path))

            # Cleanup converted file if different
            if converted_path != input_path:
                try: os.remove(converted_path)
                except: pass

            result = {
                "raw_prob": round(raw_prob, 4),
                "fake_percent": fake_p,
                "real_percent": real_p,
                "label": label,
                "file": filename # serve the original filename from uploads
            }
            return render_template("home.html", result=result)

        elif ext in ALLOWED_VIDEO:
            if not run_advanced_video_prediction:
                flash("Video analysis module not loaded")
                return redirect("/")

            model, device, img_size = ensure_model_loaded()
            output_name = f"result_{uuid.uuid4().hex}.mp4"
            output_path = UPLOADS / output_name

            video_result = run_advanced_video_prediction(
                str(input_path), model, device, img_size, str(output_path), max_frames=120
            )

            fake_p = video_result.get("fake_percent", 0.0)
            real_p = round(100.0 - fake_p, 2)
            
            result = {
                "raw_prob": round(fake_p / 100, 4),
                "fake_percent": round(fake_p, 2),
                "real_percent": real_p,
                "label": "VIDEO ANALYSIS",
                "file": output_name
            }
            return render_template("home.html", result=result)

    except Exception as e:
        print(f"Error in /predict: {e}")
        flash(f"Error analyzing file: {str(e)}")
        return redirect("/")
def api_health():
    model, _, _ = ensure_model_loaded()
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(_global.get("device", "cpu"))
    })

@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    """Main Node.js integration endpoint"""
    job_id = None
    temp_path = None
    try:
        data = request.get_json()
        job_id = data.get('jobId')
        file_url = data.get('fileUrl')
        file_type = data.get('fileType', 'image')
        
        if not job_id or not file_url:
            return jsonify({"error": "Missing jobId or fileUrl"}), 400
        
        print(f"📥 Job {job_id}: Analyzing {file_type}")
        
        # Download
        response = requests.get(file_url, timeout=30)
        response.raise_for_status()
        
        ext = ".jpg" # Default
        if ".mp4" in file_url or "video" in file_type: ext = ".mp4"
        elif ".png" in file_url: ext = ".png"
        elif ".webp" in file_url: ext = ".webp"
        
        temp_filename = f"temp_{uuid.uuid4().hex}{ext}"
        temp_path = UPLOADS / temp_filename
        with open(temp_path, 'wb') as f:
            f.write(response.content)
            
        start_time = time.time()
        
        # --- IMAGE ---
        if file_type == 'image' or ext in ALLOWED_IMG:
            converted_path = convert_image_to_standard_format(temp_path)
            raw_prob, fake_p, real_p, label = predict_image(str(converted_path))
            
            # Clean up converted file
            if converted_path != temp_path and converted_path.exists():
                try: os.remove(converted_path)
                except: pass

            risk_level = "HIGHRISK" if fake_p >= 70 else ("SUSPICIOUS" if fake_p >= 40 else "LOW")
            
            result_data = {
                "score": round(raw_prob, 4),
                "confidence": round(abs(raw_prob - 0.5) * 2, 4),
                "riskLevel": risk_level,
                "modelVersions": {"EfficientNet-B0": "1.0"},
                "processingTime": round(time.time() - start_time, 2),
                "metadata": {
                    "raw_probability": raw_prob,
                    "fake_percent": fake_p,
                    "real_percent": real_p,
                    "prediction": label,
                    "original_format": ext
                }
            }

        # --- VIDEO ---
        elif file_type == 'video' or ext in ALLOWED_VIDEO:
            if not run_advanced_video_prediction:
                raise ImportError("Video prediction module missing")
                
            model, device, img_size = ensure_model_loaded()
            output_name = f"analyzed_{uuid.uuid4().hex}.mp4"
            output_path = UPLOADS / output_name
            
            video_result = run_advanced_video_prediction(
                str(temp_path), model, device, img_size, str(output_path), max_frames=120
            )
            
            fake_p = video_result.get("fake_percent", 0.0)
            raw_prob = fake_p / 100
            real_p = video_result.get("real_percent", 100.0)
            
            risk_level = "HIGHRISK" if fake_p >= 70 else ("SUSPICIOUS" if fake_p >= 40 else "LOW")

            result_data = {
                "score": round(raw_prob, 4),
                "confidence": round(abs(raw_prob - 0.5) * 2, 4),
                "riskLevel": risk_level,
                "modelVersions": {"EfficientNet-B0": "1.0"},
                "processingTime": round(time.time() - start_time, 2),
                "metadata": {
                    "fake_percent": fake_p,
                    "real_percent": real_p,
                    "frames_analyzed": video_result.get("frames_analyzed", 0),
                    "output_video": str(output_path)
                },
                "perFrameScores": video_result.get("frame_scores", []),
                "frameCount": video_result.get("frames_analyzed", 0)
            }
        
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        # Sync to backend
        if temp_path and temp_path.exists():
            try: os.remove(temp_path)
            except: pass

        backend_url = os.environ.get('BACKEND_URL', 'http://localhost:5000')
        requests.patch(f"{backend_url}/api/job/{job_id}/result", json=result_data, timeout=10)
        
        print(f"✅ Job {job_id} complete. Score: {result_data['score']}")
        return jsonify({"success": True, "preview": result_data}), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        # Notify backend of failure
        if job_id:
            try:
                backend_url = os.environ.get('BACKEND_URL', 'http://localhost:5000')
                requests.patch(f"{backend_url}/api/job/{job_id}/error", json={"error": str(e)}, timeout=5)
            except: pass
            
        if temp_path and temp_path.exists():
            try: os.remove(temp_path)
            except: pass
            
        return jsonify({"error": str(e)}), 500

# ─────────────────────────────────────────────────────────────────────────────
# AUDIO ANALYSIS ROUTE
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analyze/audio", methods=["POST"])
def api_analyze_audio():
    job_id = None
    try:
        data     = request.get_json(force=True)
        job_id   = data.get("jobId")
        file_url = data.get("fileUrl")

        if not job_id or not file_url:
            return jsonify({"error": "jobId/fileUrl missing"}), 400

        if predict_audio is None:
            return jsonify({"error": "Audio module unavailable"}), 503

        print(f"🔊 Job {job_id}: Analyzing {file_url}")
        t_start = time.time()

        # Run inference
        result = predict_audio(file_url)
        processing_time = int((time.time() - t_start) * 1000)

        # Format result
        fake_pct = round(result["fake_probability"] * 100, 2)
        real_pct = round(result["real_probability"] * 100, 2)
        risk_level = "HIGHRISK" if fake_pct >= 80 else ("SUSPICIOUS" if fake_pct >= 50 else "LOW")

        payload = {
            "score":          result["fake_probability"],
            "confidence":     result["confidence"],
            "riskLevel":      risk_level,
            "processingTime": processing_time,
            "modelVersions":  {"audio": "wav2vec2-base"},
            "tamperRegions":  [],
            "metadata": {
                "fake_percent":     fake_pct,
                "real_percent":     real_pct,
                "label":            result["label"],
                "media_type":       "audio",
                "processing_ms":    processing_time,
            },
        }

        # Callback to backend
        backend_url = os.environ.get("BACKEND_URL", "http://localhost:5000")
        try:
            requests.patch(f"{backend_url}/api/job/{job_id}/result", json=payload, timeout=10)
            print(f"✅ Job {job_id} complete: {result['label']} ({fake_pct}%)")
        except Exception:
            pass

        return jsonify({"success": True, "preview": payload}), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        if job_id:
            try:
                backend_url = os.environ.get("BACKEND_URL", "http://localhost:5000")
                requests.patch(f"{backend_url}/api/job/{job_id}/error", json={"error": str(e)}, timeout=5)
            except: pass
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    print(f"🚀 Starting ML Service on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)

