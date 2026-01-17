# 🧠 DeepFake Detector (ML Service)

An end-to-end **DeepFake Detection ML service** built using **PyTorch** and **Flask**.  
The system is designed to identify AI-generated (fake) facial imagery and expose
the model through a lightweight web interface and inference API.

This module focuses on the **machine learning pipeline and inference layer**
of the overall project.

---

## 🚀 Project Overview

Deepfake generation techniques introduce subtle visual artifacts that are often
imperceptible to humans. This project addresses the problem by training a
convolutional neural network to distinguish between **real** and **synthetically
generated** faces.

The ML service provides:

- A configurable **training pipeline**
- A **Flask-based inference service**
- Optional **probability calibration** for reliable confidence scores
- A structure suitable for backend integration

---

## ✨ Key Capabilities

- **Image-based DeepFake Detection**
- **EfficientNet-based CNN architecture**
- **Calibrated probability outputs**
- **Fault-injection training modes for robustness testing**
- **Automatic device selection (CUDA / MPS / CPU)**
- **Web UI + JSON API for inference**

---

## 📁 Directory Structure

```
ml_service/
│
├── app.py                  # Flask application for inference and UI
├── train.py                # Model training pipeline
├── video_predictor.py      # Inference logic (image / video frames)
├── inspect_ckpt.py         # Utility for inspecting model checkpoints
│
├── templates/
│   └── home.html           # Web interface template
│
├── static/
│   └── uploads/            # Static uploads (runtime generated)
│
├── uploads/                # Uploaded media (runtime generated)
├── outputs/                # Model artifacts (excluded from version control)
│
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

> ⚠️ Model weights and generated files are intentionally excluded from version
control to maintain reproducibility and integrity.

---

## 🧠 Model Design

- **Backbone**: EfficientNet (ImageNet pre-trained)
- **Input Resolution**: Configurable (default optimized for performance)
- **Loss Function**: Binary Cross Entropy with logits
- **Output**: Single logit → probability of being fake
- **Calibration**: Isotonic regression (optional)

EfficientNet was chosen for its strong **accuracy-to-compute ratio**, making it
suitable for real-time and resource-constrained deployments.

---

## 🏋️ Training Pipeline

The training script supports both **standard training** and **experimental
robustness testing**.

### Example: Standard Training

```bash
python train.py \
  --dataset_root Dataset \
  --epochs 8 \
  --batch_size 32 \
  --img_size 128 \
  --output_dir outputs
```

### Fault Injection (Optional)

To study training instability and robustness, the pipeline supports controlled
fault injection modes such as:

* Label noise
* Input noise
* Shuffled labels
* Incorrect loss functions
* Gradient skipping

These modes are useful for **failure analysis** and **stress-testing ML systems**.

---

## 📊 Training Metrics (Reference)

During experimentation, the model demonstrated strong validation performance:

| Epoch | Validation AUC | Validation Accuracy |
| ----: | -------------: | ------------------: |
|     1 |         ~0.995 |              ~0.965 |
|     4 |         ~0.997 |              ~0.975 |
|     8 |         ~0.998 |              ~0.981 |

> Metrics may vary depending on dataset composition and training configuration.

---

## 🌐 Inference Service (Flask)

Once a trained model is available locally, the ML service can be started using:

```bash
python app.py
```

The server runs at:

```
http://127.0.0.1:5080
```

### Web Interface Features

* Image upload and preview
* Real/Fake classification
* Confidence score display
* Model and device information

---

## 🔌 API Endpoint (Debug)

A lightweight API endpoint is available for backend integration and debugging:

```bash
GET /debug?image=uploads/example.jpg&use_calib=1
```

Example response:

```json
{
  "ok": true,
  "prediction": "Fake",
  "confidence": 93.8,
  "used_calibration": true
}
```

---

## 🛠️ Tech Stack

* **Language**: Python 3.8+
* **Deep Learning**: PyTorch, timm
* **Web Framework**: Flask
* **Data Augmentation**: Albumentations
* **Calibration**: scikit-learn
* **Frontend**: HTML + Jinja2 templates

---

## ⚠️ Limitations & Notes

* Performance depends on dataset diversity and quality
* Generalization to unseen deepfake techniques is an ongoing challenge
* This system is intended for **research and detection support**, not identity verification

---

## 📈 Future Enhancements

* Video-level deepfake detection
* Frame sampling and temporal aggregation
* Explainability using Grad-CAM
* Model ensembling for improved robustness

## 🙌 Acknowledgements

* PyTorch & open-source ML community
* timm model library
* Albumentations
* Flask framework