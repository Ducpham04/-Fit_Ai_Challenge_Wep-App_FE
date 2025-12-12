# 🏋️ Fit AI Challenge Web App

A modern fitness challenge platform powered by AI, featuring real-time pose detection, personalized workout tracking, and community challenges. Built with React, TypeScript, and TensorFlow.js.

## ✨ Features

### 🤖 AI-Powered Features
- **Real-time Pose Detection**: MediaPipe and TensorFlow.js for exercise form analysis
- **Fitness AI Assistant**: WebSocket-based AI coaching and workout recommendations
- **Automated Rep Counting**: Computer vision-based exercise tracking

### 🎯 Core Functionality
- **Challenge System**: Create, join, and compete in fitness challenges
- **My Challenge**: Personalized challenge dashboard with AI integration
- **Live Leaderboards**: Real-time rankings and competition tracking
- **Progress Analytics**: Comprehensive workout reports and metrics
- **Community Features**: Social engagement and motivation
- **Rewards System**: Achievement badges and points

### 👤 User Experience
- **Onboarding Flow**: Guided user setup and goal configuration
- **Profile Management**: Customizable user profiles and preferences
- **Dashboard**: Personalized fitness metrics and insights
- **Video Upload**: Challenge submission with S3 integration
- **Admin Panel**: Complete platform management tools

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing

### UI/UX
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations

### AI/ML
- **TensorFlow.js** - Machine learning in the browser
- **MediaPipe Pose** - Pose detection and tracking
- **@tensorflow-models/pose-detection** - Pre-trained models

### State & Data
- **React Context** - Global state management (Auth, Challenges)
- **React Hook Form** - Form validation and handling
- **Axios** - HTTP client for API calls

## 📋 Prerequisites

- **Node.js** 18+ (recommended: 20.x)
- **npm** or **yarn**
- Modern web browser with WebGL support

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Ducpham04/-Fit_Ai_Challenge_Wep-App_FE.git

# Navigate to project directory
cd -Fit_Ai_Challenge_Wep-App_FE

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# App will be available at http://localhost:5173
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
src/
├── api/              # API client and service layer
├── components/       # Reusable UI components
│   ├── canvas/       # Canvas-based visualizations
│   ├── common/       # Shared components
│   ├── custom/       # Custom feature components
│   ├── fitnessAI/    # AI assistant components
│   ├── metrics/      # Data visualization
│   ├── ui/           # Radix UI components
│   └── video/        # Video handling components
├── features/         # Feature-based modules
│   ├── admin/        # Admin dashboard
│   ├── auth/         # Authentication
│   ├── challenges/   # Challenge system
│   ├── myChallenge/  # Personal challenge tracking
│   ├── onboarding/   # User onboarding
│   └── ...
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── layouts/          # Page layouts
├── router/           # Route configuration
├── services/         # Business logic
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# AWS S3 (for video uploads)
VITE_AWS_REGION=your-region
VITE_AWS_BUCKET=your-bucket-name

# Feature Flags (optional)
VITE_ENABLE_AI=true
VITE_ENABLE_VIDEO_UPLOAD=true
```

## 📖 API Documentation

The backend API documentation is available in `API_DOCUMENTATION.md`. Key endpoints:

- **Authentication**: `/api/auth/*`
- **Challenges**: `/api/challenges/*`
- **User Profile**: `/api/users/*`
- **Fitness AI**: `/api/fitness-ai/*`
- **Leaderboard**: `/api/leaderboard/*`
- **Uploads**: `/api/upload/*`

## 🎨 Component Library

This project uses **Radix UI** for accessible, unstyled components:

- Dialog, Alert Dialog, Dropdown Menu
- Accordion, Tabs, Collapsible
- Select, Checkbox, Radio Group
- Progress, Slider, Switch
- Tooltip, Popover, Hover Card
- And more...

All styled with **Tailwind CSS** for consistency.

## 🧪 Available Scripts

```bash
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run predeploy    # Pre-deployment build
npm run deploy       # Deploy to GitHub Pages
```

## 📚 Additional Documentation

- `MY_CHALLENGE_README.md` - My Challenge feature guide
- `INTEGRATION_GUIDE.md` - API integration guide
- `ONBOARDING_IMPLEMENTATION.md` - Onboarding flow
- `VIDEO_UPLOAD_INTEGRATION_FLOW.md` - Video upload system
- `BACKEND_API_QUICK_GUIDE.md` - Quick API reference

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. Code follows TypeScript best practices
2. Components are properly typed
3. UI is accessible (WCAG 2.1 AA)
4. Changes are documented

## 📄 License

This project is private and proprietary.

## 👥 Team

**Repository**: [Fit AI Challenge Web App](https://github.com/Ducpham04/-Fit_Ai_Challenge_Wep-App_FE.git)

## 🐛 Known Issues & Future Improvements

See `TODO.md` for planned features and improvements.

## 📞 Support

For questions or issues, please refer to the documentation or contact the development team.

---

**Built with ❤️ using React, TypeScript, and AI**
