# 🚀 DeepForgeX Server

> Node.js backend API powering the DeepForgeX AI DeepFake Detection System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.18+-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

---

## 🎯 Overview

The **DeepForgeX Server** is a robust RESTful API built with Node.js and Express.js. It handles authentication, file management, database operations, and seamless communication with the AI service.

### Key Features

✨ **JWT Authentication** - Secure token-based auth with OTP verification  
📁 **File Management** - Cloudinary integration for media uploads  
🔐 **Data Security** - Bcrypt encryption & input validation  
📊 **MongoDB Integration** - Efficient data storage with Mongoose  
🚦 **Rate Limiting** - Protection against abuse  
📧 **Email Service** - Nodemailer for OTP delivery  
🤖 **AI Integration** - Proxy to FastAPI ML service

---

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v4.18+) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Key Dependencies
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **nodemailer** - Email service
- **cloudinary** - Media storage
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - API rate limiting
- **validator** - Input validation
- **axios** - HTTP client

---

## 📁 Project Structure

```
server/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── cloudinary.js        # Cloudinary setup
│   └── email.js             # Email configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   └── detectionController.js # Detection operations
├── models/
│   ├── User.js              # User schema
│   ├── Analysis.js          # Analysis results schema
│   └── OTP.js               # OTP schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User endpoints
│   └── detectionRoutes.js   # Detection endpoints
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── upload.js            # File upload handling
│   ├── errorHandler.js      # Error handling
│   └── validator.js         # Input validation
├── utils/
│   ├── sendEmail.js         # Email utility
│   ├── generateOTP.js       # OTP generator
│   └── responseHandler.js   # Response formatting
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Entry point
└── package.json             # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (Atlas or local)
- **npm** or **yarn**

### Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configurations

# Start development server
npm run dev
```

The server will run on `http://localhost:5000`

### Available Scripts

```bash
npm run dev     # Development server with hot reload
npm start       # Production server
npm test        # Run tests
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/deepforgex

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary (File Upload)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_secret

# Email Service (Gmail SMTP)
SMTP_PORT=465
SMTP_HOST=smtp.gmail.com
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# AI Service
AI_SERVICE_URL=http://localhost:8001

```

---

## 🔌 API Endpoints

### User Routes (`/api/user`)

```
POST   /request-otp        # Request OTP for login/verification
POST   /verify-otp         # Verify OTP code
POST   /login              # User login
GET    /me                 # Get logged-in user profile (Protected)
GET    /logout             # User logout (Protected)
```

### Report Routes (`/api/reports`) 

```
POST   /request-otp        # Request OTP for login/verification
POST   /verify-otp         # Verify OTP code
POST   /login              # User login
GET    /me                 # Get logged-in user profile (Protected)
GET    /logout             # User logout (Protected)
```

### Job Routes (`/api/jobs`)

```
POST   /upload             # Upload & create a new job (Protected)
PATCH  /:jobId/result      # Update job results after AI processing (AI service only)
PATCH  /:jobId/error       # Handle AI service errors
GET    /:jobId/status      # Get job status (Protected)
GET    /:jobId             # Get single job by ID (Protected)
GET    /                   # Get all jobs of logged-in user (Protected)
```

---

## 🔐 Authentication Flow

1. **User Registration** → Email verification via OTP
2. **OTP Verification** → Account activation
3. **User Login** → JWT token generation
4. **Protected Routes** → JWT token validation
5. **Token Expiry** → Automatic logout & refresh

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Analysis Model
```javascript
{
  userId: ObjectId,
  fileUrl: String,
  fileType: String,
  result: {
    isDeepfake: Boolean,
    confidence: Number,
    details: Object
  },
  createdAt: Date
}
```

### OTP Model
```javascript
{
  email: String,
  otp: String,
  expiresAt: Date,
  createdAt: Date
}
```

---

## 🛡️ Middleware

### Authentication Middleware
- Validates JWT tokens
- Extracts user information
- Protects routes from unauthorized access

### Upload Middleware
- Handles multipart file uploads
- Validates file types and sizes
- Integrates with Cloudinary

### Error Handler
- Centralized error handling
- Standardized error responses
- Logging for debugging

### Validator Middleware
- Input sanitization
- Data validation
- XSS protection

---


## 📦 Deployment



### Production Build

```bash
# Set environment to production
NODE_ENV=production

# Start server
npm start
```

### Deployment Platforms
- **Heroku** - Easy deployment with Git
- **Railway** - Modern platform with auto-deploy
- **DigitalOcean** - VPS deployment
- **AWS EC2** - Scalable cloud infrastructure

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

---

## 📄 License

This project is part of the BlackMirror system.

---

*Built with ❤️ by Team Stack Pirates*