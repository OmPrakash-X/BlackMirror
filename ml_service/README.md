# 🧠 DeepFake Detector

**A high-performance AI system for detecting synthetic and manipulated faces in images**

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-orange)
![Flask](https://img.shields.io/badge/Flask-2.3%2B-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)
[![Hackathon](https://img.shields.io/badge/Hackathon-Project-orange)]()


---

## 📖 Overview

DeepFake Detector is a production-ready deep learning system that identifies AI-generated and manipulated faces in images with exceptional accuracy. Built on PyTorch and deployed with Flask, the system achieves **99.8% AUC** and **98.1% accuracy** on validation data, making it suitable for real-world applications in media verification and content moderation.

The platform combines state-of-the-art computer vision models with a user-friendly web interface, providing instant predictions with calibrated confidence scores for reliable decision-making.

---

## ✨ Key Features

- **🎯 High Accuracy** - 99.8% AUC and 98.1% validation accuracy
- **⚡ Real-time Inference** - Instant predictions through web interface
- **📊 Model Calibration** - Isotonic regression for reliable probability estimates
- **🔬 Fault Injection** - Experimental training modes for robustness testing
- **💻 Multi-device Support** - Automatic GPU/MPS/CPU detection
- **🚀 Production Ready** - Clean API and responsive web interface
- **🔌 RESTful API** - JSON endpoints for integration with other systems

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Training](#-training)
- [Web Interface](#-web-interface)
- [API Usage](#-api-usage)
- [Model Performance](#-model-performance)
- [Fault Injection Modes](#-fault-injection-modes)
- [Technical Details](#-technical-details)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- 4GB+ RAM
- NVIDIA GPU (optional, for faster training)
- Git

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/MoteeshA/DeepFake.git
cd DeepFake

# Create virtual environment
python -m venv venv

# Activate environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Manual Dependency Installation

If `requirements.txt` is not available, install core dependencies:

```bash
pip install torch torchvision torchaudio
pip install flask timm albumentations scikit-learn pillow joblib
```

---

## 🎯 Quick Start

### Using Pre-trained Model

**Step 1:** Download pre-trained weights and place them in the `outputs/` folder:
- `best_model.pth` - Best validation performance
- `final_model.pth` - Final trained model
- `calibrator.joblib` - Calibration model

**Step 2:** Launch the web application:
```bash
python app.py
```

**Step 3:** Open your browser to `http://127.0.0.1:5080`

**Step 4:** Upload an image and receive instant real/fake predictions

### Training from Scratch

```bash
# Standard training (8 epochs, 128px images)
python train_fast_faulty.py --dataset_root Dataset --epochs 8 --img_size 128 --output_dir outputs
```

---

## 📁 Project Structure

```
DeepFake/
│
├── app.py                          # Flask web application
├── train_fast_faulty.py            # Training pipeline with fault injection
├── requirements.txt                # Python dependencies
│
├── outputs/                        # Model artifacts (created after training)
│   ├── best_model.pth              # Best validation model
│   ├── final_model.pth             # Final trained model
│   └── calibrator.joblib           # Calibration model
│
├── Dataset/                        # Training data directory
│   ├── Train/
│   │   ├── Real/                   # Authentic face images
│   │   └── Fake/                   # Synthetic/manipulated images
│   └── Validation/
│       ├── Real/                   # Real validation images
│       └── Fake/                   # Fake validation images
│
├── templates/
│   └── home.html                   # Web interface template
├── uploads/                        # User-uploaded images (auto-created)
└── preproc_data/                   # Preprocessed tensors (auto-created)
```

---

## 🏋️‍♂️ Training

### Standard Training

```bash
python train_fast_faulty.py \
    --dataset_root Dataset \
    --epochs 8 \
    --batch_size 32 \
    --img_size 128 \
    --lr 0.001 \
    --use_mps \
    --output_dir outputs
```

### Advanced Training Options

```bash
# With data augmentation and calibration
python train_fast_faulty.py \
    --dataset_root Dataset \
    --epochs 15 \
    --batch_size 64 \
    --img_size 224 \
    --use_amp \
    --calibrate \
    --output_dir outputs
```

### Training Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--dataset_root` | `Dataset` | Path to dataset directory |
| `--epochs` | `8` | Number of training epochs |
| `--batch_size` | `32` | Training batch size |
| `--img_size` | `128` | Input image size (pixels) |
| `--lr` | `0.001` | Initial learning rate |
| `--use_amp` | `False` | Enable automatic mixed precision |
| `--calibrate` | `False` | Enable probability calibration |
| `--use_mps` | `False` | Use Apple Silicon GPU |

### Training Progress Example

```
Epoch 1/8 - Train Loss: 0.2154, Val Loss: 0.0981, Val AUC: 0.9954, Val Acc: 0.9654
Epoch 4/8 - Train Loss: 0.0876, Val Loss: 0.0623, Val AUC: 0.9971, Val Acc: 0.9751
Epoch 8/8 - Train Loss: 0.0452, Val Loss: 0.0418, Val AUC: 0.9980, Val Acc: 0.9810
```

---

## 🌐 Web Interface

### Starting the Server

```bash
python app.py
```

Server starts at: `http://127.0.0.1:5080`

### Features

- **Drag & Drop Upload** - Intuitive image upload interface
- **Real-time Preview** - Instant image preview before analysis
- **Confidence Scores** - Detailed probability breakdowns
- **Model Information** - Display of current model and calibration status
- **Mobile Responsive** - Optimized for all device sizes

### Example Prediction Output

```
🎯 Prediction: Fake
📊 Confidence: 98.4%
🤖 Model: EfficientNet-B0
⚖️ Calibration: Enabled
```

---

## 🔌 API Usage

### Endpoint

```
GET /debug?image=<path>&use_calib=<0|1>
```

### Example Request

```bash
curl "http://127.0.0.1:5080/debug?image=uploads/test_image.jpg&use_calib=1"
```

### Response Format

```json
{
  "ok": true,
  "image": "uploads/test_image.jpg",
  "result": {
    "logit": 2.5178,
    "raw_prob": 0.924,
    "calibrated": 0.938,
    "percent": 93.8,
    "prediction": "Fake"
  },
  "used_calibrator": true,
  "model_device": "cuda:0"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Request success status |
| `image` | string | Path to analyzed image |
| `logit` | float | Raw model output |
| `raw_prob` | float | Uncalibrated probability |
| `calibrated` | float | Calibrated probability |
| `percent` | float | Confidence percentage |
| `prediction` | string | "Real" or "Fake" |

---

## 📊 Model Performance

### Validation Metrics (8 Epochs)

| Epoch | Validation AUC | Validation Accuracy |
|-------|----------------|---------------------|
| 1     | 0.9954         | 0.9654              |
| 4     | 0.9971         | 0.9751              |
| 8     | 0.9980         | 0.9810              |

### Final Performance

- **AUC**: 0.9980 (99.8%)
- **Accuracy**: 0.9810 (98.1%)
- **Precision**: 0.978
- **Recall**: 0.984

---

## 🔬 Fault Injection Modes

For research and robustness testing, the training pipeline supports various fault injection modes to study model behavior under adversarial conditions.

### Available Modes

| Mode | Command Flag | Description |
|------|--------------|-------------|
| **Label Noise** | `--faulty_mode label_noise` | Randomly flips training labels |
| **Input Noise** | `--faulty_mode input_noise` | Adds Gaussian noise to images |
| **Shuffle Labels** | `--faulty_mode shuffle_labels` | Shuffles labels within batches |
| **Wrong Loss** | `--faulty_mode wrong_loss` | Uses incorrect loss function |
| **Zero Gradients** | `--zero_grad_every_n N` | Skips gradient updates every N batches |
| **Weight Reset** | `--faulty_mode random_weight_reset` | Randomly resets model weights |

### Example Usage

```bash
# Train with 30% label noise
python train_fast_faulty.py --faulty_mode label_noise --label_noise_frac 0.3

# Train with input corruption
python train_fast_faulty.py --faulty_mode input_noise --input_noise_std 0.1
```

---

## 🛠️ Technical Details

### Model Architecture

- **Backbone**: EfficientNet-B0 (pretrained on ImageNet)
- **Classifier Head**: 2-layer MLP with Dropout (p=0.2)
- **Input Size**: 128×128×3 (configurable to 224×224)
- **Output**: Single logit → Sigmoid probability

### Training Configuration

- **Loss Function**: BCEWithLogitsLoss
- **Optimizer**: AdamW (lr=1e-3, weight_decay=1e-4)
- **Scheduler**: ReduceLROnPlateau
- **Batch Size**: 32-64 (GPU memory dependent)
- **Validation**: Full validation set after each epoch

### Data Augmentation Pipeline

- Random horizontal flip (p=0.5)
- Color jitter (brightness, contrast, saturation)
- Random rotation (±10 degrees)
- Normalization using ImageNet statistics

### Calibration

The system uses Isotonic Regression for probability calibration, ensuring that predicted probabilities accurately reflect true confidence levels. This is crucial for real-world deployment where decision thresholds matter.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PyTorch** team for the excellent deep learning framework
- **timm** library for pretrained model architectures
- **Albumentations** for robust image augmentation pipeline
- **Flask** for the lightweight web framework
- Open-source community for tools and research

---

## ⚠️ Disclaimer

This tool is intended for research and educational purposes. While it achieves high accuracy, no detection system is perfect. Always verify critical content through multiple sources and methods.

---

## ⭐ Show Your Support

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with precision and care by Team Stack Pirates** 🏴‍☠️