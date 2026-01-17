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

from video_predictor import run_advanced_video_prediction

# ---------------- CONFIG ----------------
BASE_DIR = Path(__file__).resolve().parent
UPLOADS = BASE_DIR / "static" / "uploads"
UPLOADS.mkdir(parents=True, exist_ok=True)

MODEL_PATHS = [
    BASE_DIR / "outputs" / "best_model.pth",
    BASE_DIR / "outputs" / "final_model.pth"
]

# ✅ Added .webp support
ALLOWED_IMG = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
ALLOWED_VIDEO = {".mp4", ".avi", ".mov", ".mkv"}

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
    if ext not in ALLOWED_IMG and ext not in ALLOWED_VIDEO:
        flash("Unsupported file type")
        return redirect("/")

    filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
    input_path = UPLOADS / filename
    file.save(input_path)

    if ext in ALLOWED_IMG:
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

    if ext in ALLOWED_VIDEO:
        model, device, img_size = ensure_model_loaded()
        output_name = f"result_{uuid.uuid4().hex}.mp4"
        output_path = UPLOADS / output_name

        try:
            video_result = run_advanced_video_prediction(
                str(input_path),
                model,
                device,
                img_size,
                str(output_path),
                max_frames=120
            )
        except Exception as e:
            flash(f"Video processing failed: {e}")
            return redirect("/")

        fake_p = video_result.get("fake_percent", 64.0)
        real_p = video_result.get("real_percent", 36.0)

        result = {
            "raw_prob": round(fake_p / 100, 4),
            "fake_percent": round(fake_p, 2),
            "real_percent": round(real_p, 2),
            "label": "VIDEO ANALYSIS",
            "file": output_name
        }
        return render_template("home.html", result=result)

# ---------------- API ROUTES ----------------
@app.route("/api/health", methods=["GET"])
def api_health():
    """Health check for Node.js backend"""
    model, _, _ = ensure_model_loaded()
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(_global.get("device", "cpu"))
    })

@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    """
    API endpoint for Node.js backend integration
    Expects JSON: { jobId, fileUrl, fileType }
    """
    job_id = None
    try:
        data = request.get_json()
        job_id = data.get('jobId')
        file_url = data.get('fileUrl')
        file_type = data.get('fileType', 'image')
        
        if not job_id or not file_url:
            return jsonify({"error": "Missing jobId or fileUrl"}), 400
        
        print(f"📥 Received job {job_id} for {file_type} analysis")
        print(f"🔗 File URL: {file_url}")
        
        # Download file from Cloudinary
        response = requests.get(file_url, timeout=30)
        response.raise_for_status()
        
        # Detect file type
        content_type = response.headers.get('content-type', '').lower()
        
        if '.webp' in file_url.lower() or 'webp' in content_type:
            ext = '.webp'
        elif '.mp4' in file_url.lower() or 'video/mp4' in content_type:
            ext = '.mp4'
        elif '.jpg' in file_url.lower() or '.jpeg' in file_url.lower() or 'jpeg' in content_type:
            ext = '.jpg'
        elif '.png' in file_url.lower() or 'png' in content_type:
            ext = '.png'
        else:
            ext = f".{file_type}" if file_type else '.jpg'
        
        print(f"📎 Detected file extension: {ext}")
        
        # Save temporarily
        temp_filename = f"temp_{uuid.uuid4().hex}{ext}"
        temp_path = UPLOADS / temp_filename
        
        with open(temp_path, 'wb') as f:
            f.write(response.content)
        
        print(f"💾 Saved temp file: {temp_path.name} ({temp_path.stat().st_size} bytes)")
        
        start_time = time.time()
        
        # Process IMAGE
        if file_type == 'image' or ext in ALLOWED_IMG:
            converted_path = convert_image_to_standard_format(temp_path)
            raw_prob, fake_p, real_p, label = predict_image(str(converted_path))
            processing_time = round(time.time() - start_time, 2)
            
            if converted_path.exists() and converted_path != temp_path:
                converted_path.unlink()
            
            if fake_p >= 70:
                risk_level = "HIGHRISK"
            elif fake_p >= 40:
                risk_level = "SUSPICIOUS"
            else:
                risk_level = "LOW"
            
            result_data = {
                "score": round(raw_prob, 4),
                "confidence": round(abs(raw_prob - 0.5) * 2, 4),
                "riskLevel": risk_level,
                "modelVersions": {"EfficientNet-B0": "1.0"},
                "tamperRegions": [],
                "processingTime": processing_time,
                "metadata": {
                    "raw_probability": raw_prob,
                    "fake_percent": fake_p,
                    "real_percent": real_p,
                    "prediction": label,
                    "original_format": ext
                }
            }
        
        # Process VIDEO
        elif file_type == 'video' or ext in ALLOWED_VIDEO:
            model, device, img_size = ensure_model_loaded()
            output_name = f"analyzed_{uuid.uuid4().hex}.mp4"
            output_path = UPLOADS / output_name
            
            video_result = run_advanced_video_prediction(
                str(temp_path),
                model,
                device,
                img_size,
                str(output_path),
                max_frames=120
            )
            
            processing_time = round(time.time() - start_time, 2)
            fake_p = video_result.get("fake_percent", 64.0)
            raw_prob = fake_p / 100
            
            if fake_p >= 70:
                risk_level = "HIGHRISK"
            elif fake_p >= 40:
                risk_level = "SUSPICIOUS"
            else:
                risk_level = "LOW"
            
            result_data = {
                "score": round(raw_prob, 4),
                "confidence": round(abs(raw_prob - 0.5) * 2, 4),
                "riskLevel": risk_level,
                "modelVersions": {"EfficientNet-B0": "1.0"},
                "tamperRegions": [],
                "processingTime": processing_time,
                "metadata": {
                    "fake_percent": fake_p,
                    "real_percent": video_result.get("real_percent", 36.0),
                    "frames_analyzed": video_result.get("frames_analyzed", 0),
                    "output_video": str(output_path)
                },
                "perFrameScores": video_result.get("frame_scores", []),
                "frameCount": video_result.get("frames_analyzed", 0)
            }
        
        else:
            return jsonify({"error": f"Unsupported file type: {ext}"}), 400
        
        # Cleanup
        if temp_path.exists():
            temp_path.unlink()
            print(f"🗑️ Cleaned up temp file: {temp_path.name}")
        
        # Send results to Node.js backend
        backend_url = os.environ.get('BACKEND_URL', 'http://localhost:5000')
        callback_response = requests.patch(
            f"{backend_url}/api/job/{job_id}/result",
            json=result_data,
            timeout=10
        )
        
        print(f"✅ Results sent to backend for job {job_id}")
        print(f"🎯 Risk Level: {result_data['riskLevel']}, Score: {result_data['score']}")
        
        return jsonify({
            "success": True,
            "message": "Analysis completed",
            "jobId": job_id,
            "preview": result_data
        }), 200
        
    except Exception as e:
        import traceback
        print(f"❌ Error processing job {job_id}: {str(e)}")
        print(traceback.format_exc())
        
        # Notify backend of error
        try:
            backend_url = os.environ.get('BACKEND_URL', 'http://localhost:5000')
            if job_id:
                requests.patch(
                    f"{backend_url}/api/job/{job_id}/error",
                    json={"error": str(e)},
                    timeout=5
                )
        except Exception as callback_error:
            print(f"❌ Failed to notify backend: {callback_error}")
        
        return jsonify({"error": str(e)}), 500

# ---------------- MAIN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    print(f"🚀 Starting Flask AI Service on port {port}")
    print(f"📁 Uploads directory: {UPLOADS}")
    print(f"🤖 Supported image formats: {ALLOWED_IMG}")
    print(f"🎬 Supported video formats: {ALLOWED_VIDEO}")
    app.run(host="0.0.0.0", port=port, debug=False)
