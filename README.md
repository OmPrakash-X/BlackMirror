# 🪞 BlackMirror

**An AI-powered media authenticity platform to combat misinformation in the digital age**

[![Hackathon](https://img.shields.io/badge/Hackathon-Project-orange)]()
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)]()

> **Built by Team Stack Pirates** 🏴‍☠️

---

## 📖 Overview

BlackMirror is a full-stack media authenticity verification platform that leverages artificial intelligence and deep learning to identify manipulated images and videos. The system achieves **99.8% AUC** and **98.1% accuracy** in detecting deepfakes and synthetic content, making it a powerful tool in the fight against digital misinformation.

---

## 🎯 Hackathon Theme

**AI and Deep Learning**

---

## ✨ Key Features

- 🖼️ **Media Upload System** - Support for images and videos with drag & drop
- 🤖 **AI-Powered Detection** - Deep learning models achieving 99.8% AUC
- 📊 **Detailed Reports** - Comprehensive authenticity analysis with confidence scores
- 🔒 **Secure Authentication** - JWT-based auth with OTP verification
- ⚡ **Real-time Processing** - Efficient job queue management
- 📱 **Responsive Design** - Modern interface across all devices

---

## 🏗️ System Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───> │   Backend   │ ───> │  AI Service │
│   (React)   │ <─── │  (Express)  │ <─── │  (PyTorch)  │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  MongoDB +  │
                     │  Cloudinary │
                     └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Redux Toolkit, Vite |
| **Backend** | Node.js, Express, MongoDB, JWT, Cloudinary |
| **AI/ML** | Python, PyTorch, Flask, EfficientNet-B0 |
| **Storage** | MongoDB Atlas, Cloudinary CDN |

---

## 📁 Repository Structure

```
BlackMirror/
│
├── client/          # React frontend application
│   └── README.md    # Frontend documentation
│
├── server/          # Node.js backend API
│   └── README.md    # Backend documentation
│
├── ml_service/      # Python AI/ML service
│   └── README.md    # AI service documentation
│
└── README.md        # This file
```

### 📚 Component Documentation

- **[Frontend Documentation](./client/README.md)** - React app setup, components, and deployment
- **[Backend Documentation](./server/README.md)** - API endpoints, authentication, and database
- **[AI Service Documentation](./ml_service/README.md)** - Model architecture, training, and inference

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- MongoDB (Atlas or local)

### Installation

```bash
# Clone the repository
git clone https://github.com/OmPrakash-X/BlackMirror.git
cd blackmirror

# Setup Frontend
cd client
npm install
cp .env.example .env
npm run dev  # Runs on http://localhost:5173

# Setup Backend (new terminal)
cd ../server
npm install
cp .env.example .env
npm run dev  # Runs on http://localhost:5000

# Setup AI Service (new terminal)
cd ../ml_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py  # Runs on http://localhost:8001
```

---

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| **AUC** | 99.8% |
| **Accuracy** | 98.1% |
| **Precision** | 97.8% |
| **Recall** | 98.4% |

**Model**: EfficientNet-B0 with isotonic calibration

---

## 🚦 Development Status

- ✅ Frontend UI/UX implementation
- ✅ Backend API with MongoDB
- ✅ AI model training (99.8% AUC)
- ✅ JWT authentication
- 🚧 Service integration
- 🚧 Real-time job processing
- ⏳ Video analysis support
- ⏳ Batch processing

---

## 🔌 API Overview

Detailed API documentation is available in the [Backend README](./server/README.md).

**Key Endpoints:**
- `POST /api/user/login` - User authentication
- `POST /api/jobs/upload` - Upload media for analysis
- `GET /api/reports/:id` - Retrieve analysis results

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
## 👥 Team

**Team Stack Pirates** 🏴‍☠️

For questions or collaboration, feel free to reach out!

---

## ⚠️ Disclaimer

This is a hackathon prototype under active development. Features and implementation details are subject to change. The tool is intended for research and educational purposes.

---

## 🙏 Acknowledgments

- PyTorch and timm for deep learning frameworks
- MongoDB and Cloudinary for infrastructure
- Open-source community for tools and resources

---

**⭐ If you find this project useful, please give it a star!**