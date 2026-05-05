# 🎨 BlackMirror Client

> Modern React frontend for the BlackMirror AI DeepFake Detection System

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

---

## 🎯 Overview

The ** Client** is a modern, responsive React application built with Vite. It provides an intuitive interface for users to upload media files, analyze them for deepfakes, and view detection results with beautiful visualizations.

### Key Features

✨ **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS  
🚀 **Fast Performance** - Lightning-fast builds with Vite  
🔐 **Secure Auth** - JWT authentication with OTP verification  
📤 **Drag & Drop** - Intuitive file upload interface  
📊 **Real-time Results** - Live analysis progress and results  
🎨 **Toast Notifications** - Beautiful feedback with Sonner  
🌙 **Dark Mode Ready** - Built with dark mode support  
📱 **Mobile Responsive** - Works seamlessly on all devices

---

## 🛠️ Tech Stack

### Core Technologies
- **React 18** - Modern UI library with hooks
- **Vite 5** - Next-generation frontend tooling
- **Tailwind CSS 3** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing

### Key Dependencies
- **axios** - HTTP client for API calls
- **sonner** - Beautiful toast notifications
- **lucide-react** - Modern icon library
- **framer-motion** - Animation library
- **react-dropzone** - File upload component
- **recharts** - Data visualization
- **react-helmet** - Document head manager

---

## 📁 Project Structure

```
client/
├── public/
├── src/
│   ├── assets/              # Images, fonts, static files
│   ├── components/          # React components
│   │   └── ui/              # UI components
│   │       ├── AnalysisResults.tsx
│   │       ├── Dashboard.tsx
│   │       ├── DashboardPreview.tsx
│   │       ├── FeatureCards.tsx
│   │       ├── Footer.tsx
│   │       ├── HeroSection.tsx
│   │       ├── ImageWithFallback.tsx
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── TechSection.tsx
│   │       └── UploadSection.tsx
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Page components
│   │   └── AnalysisPage.tsx
│   ├── redux/               # Redux state management
│   │   ├── slices/
│   │   │   └── userSlice.ts
│   │   └── store.ts         # Redux store configuration
│   ├── App.tsx              # Root component
│   ├── index.css            # Global styles
│   ├── main.tsx             # Entry point
│   └── vite-env.d.ts        # Vite type definitions
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── components.json          # Component configuration
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── package-lock.json        # Dependency lock file
├── package.json             # Dependencies & scripts
├── postcss.config.js        # PostCSS configuration
├── README.md                # Documentation
├── tsconfig.app.json        # TypeScript app config
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript Node config
└── vite.config.ts           # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- Backend server running on port 5000

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configurations

# Start development server
npm run dev
```

The app will run on `http://localhost:5173`

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Lint code with ESLint
npm run format      # Format code with Prettier
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the client directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
```

---

## 🎨 Key Components

### Authentication Components

#### LoginForm
- Email/password validation
- JWT token handling
- Error messaging
- Remember me functionality

#### RegisterForm
- User registration
- Email validation
- Password strength indicator
- Terms acceptance

### Detection Components

#### FileUpload
- Drag & drop interface
- File type validation
- Size limit checking
- Preview functionality
- Progress indicator

#### AnalysisResult
- Confidence score display
- Visual indicators
- Detailed breakdown
- Export options

#### HistoryCard
- Past analysis records
- Timestamp display
- Quick actions
- Filtering options

### Layout Components

#### Navbar
- Responsive navigation
- User menu dropdown
- Mobile hamburger menu
- Active route highlighting

#### Footer
- Social links
- Quick navigation
- Copyright info
- Contact details

---

## 📦 Build & Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Output will be in the `dist/` directory.

### Deployment Platforms
- **Vercel** - Automatic deployments with Git
- **Netlify** - Easy static site hosting
- **GitHub Pages** - Free hosting for static sites
- **AWS S3 + CloudFront** - Scalable CDN deployment

### Build Optimization
- Code splitting
- Tree shaking
- Asset compression
- Lazy loading
- Image optimization

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