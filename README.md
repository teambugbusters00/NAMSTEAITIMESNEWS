# ET Gen AI - Financial News Intelligence Platform

> An AI-powered financial news aggregation and analysis platform that transforms complex market data into actionable insights through interactive visualizations, mind maps, and real-time briefings.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.4-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Tech Stack](#tech-stack)
- [Components Diagram](#components-diagram)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

ET Gen AI is a sophisticated financial news intelligence platform designed to help retail investors and market analysts stay ahead of the curve. The platform leverages advanced AI models to:

- **Aggregate** financial news from multiple sources
- **Analyze** market trends and sentiment
- **Visualize** complex data through interactive mind maps
- **Generate** AI-powered market briefings
- **Personalize** content based on user preferences

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           UI Layer (Shadcn/ui + Tailwind)                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │LandingPage│  │Dashboard │  │ DeepDive │  │ AuthPage │  │Onboarding│    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                               Pages                                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           Components                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Layout   │  │  MindMap │  │   Chat   │  │  Video   │  │   News   │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      State Management (AppContext)                       │    │
│  │                      Firebase Auth + Firestore                           │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (REST API)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVER (Node.js + Express)                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                              API Routes                                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │   News   │  │   Auth   │  │   Chat   │  │   Video  │  │ MindMap  │    │    │
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                            Controllers                                   │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │    │
│  │  │   News     │  │   Auth     │  │   Chat     │  │  Video     │          │    │
│  │  │ Controller │  │ Controller │  │ Controller │  │ Controller │          │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          AI Integration Layer                             │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │    │
│  │  │  Groq SDK       │  │  Gemini AI      │  │  Firecrawl API  │          │    │
│  │  │  (LLaMA 4)      │  │  (Gemini Flash) │  │  (Web Scraping) │          │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         Data Layer (MongoDB)                             │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │    │
│  │  │   User    │  │  Session  │  │   News   │  │  Chat    │                  │    │
│  │  │  Model    │  │  Storage  │  │  Cache    │  │  History  │                  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ External APIs
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │  Groq API       │  │  Gemini AI      │  │  Firecrawl      │  │ Firebase │  │
│  │  (LLM Models)   │  │  (Mind Maps)    │  │  (Scraping)     │  │ (Auth)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │  NewsData.io    │  │  Alpha Vantage  │  │  MongoDB Atlas   │               │
│  │  (News API)     │  │  (Stock Data)   │  │  (Database)     │               │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ET Gen AI/
├── client/                          # React Frontend Application
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── ui/                  # Shadcn/ui Components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   └── avatar.tsx
│   │   │   ├── Layout.tsx           # Main Layout Component
│   │   │   ├── MindMap.tsx          # Interactive Mind Map Component
│   │   │   └── OnboardingModal.tsx  # Onboarding Flow
│   │   ├── pages/                   # Page Components
│   │   │   ├── LandingPage.tsx     # Landing/Hero Page
│   │   │   ├── Dashboard.tsx        # Main Dashboard
│   │   │   ├── DeepDive.tsx         # Article Detail View
│   │   │   └── AuthPage.tsx         # Authentication Page
│   │   ├── contexts/
│   │   │   └── AppContext.tsx       # Global State Management
│   │   ├── firebase/
│   │   │   ├── auth.ts              # Firebase Auth Logic
│   │   │   └── firebase.ts          # Firebase Configuration
│   │   ├── App.tsx                  # Main App Component
│   │   ├── App.css                  # Global Styles
│   │   ├── main.tsx                 # Entry Point
│   │   └── index.css                # Tailwind Imports
│   ├── public/                      # Static Assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                          # Node.js Backend API
│   ├── controllers/                 # Business Logic
│   │   ├── auth.controller.js       # Authentication Logic
│   │   ├── chat.controller.js       # Chat/AI Logic
│   │   ├── mindmap.controller.js    # Mind Map Generation
│   │   ├── news.controller.js       # News Aggregation
│   │   └── video.controller.js      # Video Processing
│   ├── routes/                      # API Routes
│   │   ├── auth.routes.js
│   │   ├── chat.routes.js
│   │   ├── mindmap.routes.js
│   │   ├── news.routes.js
│   │   └── video.routes.js
│   ├── models/                      # MongoDB Models
│   │   └── User.model.js
│   ├── middleware/                  # Express Middleware
│   │   └── auth.middleware.js
│   ├── config/                      # Configuration
│   │   └── firebase.js
│   ├── index.js                     # Server Entry Point
│   ├── package.json
│   └── .env.example
│
├── README.md                        # This File
└── .gitignore
```

---

## ✨ Features

### 🔍 Core Features

- **📰 News Aggregation**
  - Real-time financial news from multiple sources
  - Customizable search with filters (category, region, language)
  - AI-powered news briefing generation

- **🧠 Interactive Mind Maps**
  - AI-generated mind maps for complex topics
  - Visual representation of news relationships
  - Expandable/collapsible nodes with details

- **💬 AI Chat Interface**
  - Groq-powered conversational AI
  - Context-aware responses
  - Trading insights and recommendations

- **📊 Dashboard**
  - Personalized news feed
  - Market trends visualization
  - Watchlist integration

- **🎥 Video Analysis**
  - Video capability detection
  - AI-powered video insights (planned)

### 🔐 Authentication & User Management

- Firebase Authentication (Google Sign-In)
- JWT-based session management
- User preferences persistence

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- API Keys:
  - Groq API Key
  - Google Gemini API Key
  - Firebase Configuration
  - NewsData.io API Key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ET-HAX-002
   ```

2. **Setup Backend**
   ```bash
   cd "ET Gen AI/server"
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Setup Frontend**
   ```bash
   cd "ET Gen AI/client"
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your Firebase config
   ```

4. **Start Development Servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd "ET Gen AI/server"
   npm run dev
   ```
   Server runs on: `http://localhost:3000`
   
   **Terminal 2 - Frontend:**
   ```bash
   cd "ET Gen AI/client"
   npm run dev
   ```
   Client runs on: `http://localhost:5173`

5. **Open in Browser**
   Navigate to: `http://localhost:5173`

---

## 🔌 API Endpoints

### News Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news/fetch` | Fetch and process news articles |
| POST | `/api/news/briefing` | Generate AI-powered news briefing |

**Query Parameters:**
- `query` - Search topic (e.g., "retail investor")
- `category` - News category (All, Business, Technology, etc.)
- `region` - Geographic region (Global, US, Europe, Asia)
- `language` - Language code (en, etc.)

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync Firebase user to MongoDB |
| POST | `/api/auth/verify` | Verify JWT token |
| GET | `/api/auth/user/:uid` | Get user data |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/chat` | Send message to AI chatbot |

### Mind Map Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mindmap/generate` | Generate AI mind map |

### Video Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/video/capabilities` | Get video processing capabilities |
| POST | `/api/video/create` | Create video content |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |
| GET | `/api` | API information |

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 19.2.4 with TypeScript
- **Build Tool:** Vite 8.0.1
- **Styling:** Tailwind CSS 4.2.2
- **UI Components:** Shadcn/ui (Radix UI)
- **State Management:** React Context + Firebase
- **Routing:** React Router DOM 7.13.2
- **Animations:** Framer Motion 12.38.0
- **Flowcharts:** @xyflow/react 12.10.2

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5.2.1
- **Database:** MongoDB with Mongoose 9.3.3
- **AI Models:**
  - Groq SDK 1.1.2 (LLaMA 4 Scout)
  - Gemini AI SDK 0.24.1
- **Authentication:** Firebase Admin SDK 13.7.0
- **Rate Limiting:** express-rate-limit 8.3.1
- **CORS:** cors 2.8.6

### External Services
- **Database:** MongoDB Atlas
- **Auth:** Firebase Authentication
- **News API:** NewsData.io (or similar)
- **Web Scraping:** Firecrawl API

---

## 📊 Components Diagram

### Frontend Component Hierarchy

```
App
├── AppProvider (Context)
├── BrowserRouter
│   └── Routes
│       └── Layout (Main Layout)
│           ├── Header
│           │   ├── Logo
│           │   ├── Navigation
│           │   └── UserMenu (Avatar, Sign In/Out)
│           ├── Outlet
│           │   ├── LandingPage
│           │   │   ├── HeroSection
│           │   │   ├── FeaturesGrid
│           │   │   └── CTASection
│           │   ├── AuthPage
│           │   │   ├── AuthTabs (Sign In/Sign Up)
│           │   │   ├── GoogleSignInButton
│           │   │   └── EmailForm
│           │   ├── Dashboard
│           │   │   ├── DashboardHeader (Search, Filters)
│           │   │   ├── NewsGrid
│           │   │   │   └── NewsCard (per article)
│           │   │   ├── WatchlistPanel
│           │   │   └── TrendingTopics
│           │   └── DeepDive
│           │       ├── ArticleHeader
│           │       ├── ArticleContent
│           │       ├── RelatedArticles
│           │       └── MindMapPanel
│           └── Footer
└── OnboardingModal (Global Overlay)
    ├── Step1: Welcome
    ├── Step2: Preferences
    └── Step3: Complete
```

### Backend Component Architecture

```
Server (Express App)
├── Middleware
│   ├── CORS (Configurable Origins)
│   ├── Rate Limiter (100 req/15min)
│   ├── JSON Body Parser
│   └── Auth Middleware
├── Routes
│   ├── /api/news
│   │   ├── GET /fetch
│   │   ├── POST /briefing
│   │   └── news.controller.js
│   ├── /api/auth
│   │   ├── POST /sync
│   │   ├── POST /verify
│   │   ├── GET /user/:uid
│   │   └── auth.controller.js
│   ├── /api/chat
│   │   ├── POST /chat
│   │   └── chat.controller.js
│   ├── /api/mindmap
│   │   ├── POST /generate
│   │   └── mindmap.controller.js
│   └── /api/video
│       ├── GET /capabilities
│       ├── POST /create
│       └── video.controller.js
├── Models
│   └── User (Mongoose Schema)
├── Controllers (Business Logic)
│   ├── News Controller
│   │   ├── fetchNews()
│   │   ├── processArticles()
│   │   └── generateBriefing()
│   ├── Auth Controller
│   │   ├── syncUser()
│   │   ├── verifyToken()
│   │   └── getUser()
│   ├── Chat Controller
│   │   └── handleChat()
│   ├── MindMap Controller
│   │   └── generateMindMap()
│   └── Video Controller
│       ├── getCapabilities()
│       └── createVideo()
└── External Integrations
    ├── Groq AI (LLM)
    ├── Gemini AI (Mind Maps)
    ├── Firebase Admin (Auth)
    └── MongoDB (Database)
```

### Data Flow Diagram

```
User Action (Click "Search")
    │
    ▼
Frontend (React)
    │
    ├── Update State (AppContext)
    │
    ▼
API Call (fetch('/api/news/fetch?query=...'))
    │
    ▼
Backend (Express)
    │
    ├── Validate Request
    │
    ├── Check Rate Limit
    │
    ├── Call NewsData.io API
    │
    ▼
Process Articles (AI Analysis)
    │
    ├── For each article:
    │   ├── Call Groq API for summary
    │   └── Parse and structure data
    │
    ▼
Store in MongoDB (Cache)
    │
    ▼
Return Response to Client
    │
    ▼
Update UI (React)
    │
    ├── Show Loading State
    │
    ├── Render News Cards
    │
    └── Display Mind Map Option
```

---

## 🔄 Interactive Components

### Mind Map Component Structure

```
MindMap Component
├── ReactFlow Canvas
│   ├── Controls (Zoom, Pan)
│   ├── Background (Grid Pattern)
│   └── Nodes
│       ├── CentralNode (Topic)
│       │   └── type: 'input'
│       ├── CategoryNodes (Subtopics)
│       │   └── type: 'default'
│       └── DetailNodes (Facts)
│           └── type: 'default'
├── Panel (Controls)
│   ├── Zoom In Button
│   ├── Zoom Out Button
│   ├── Fit View Button
│   ├── Export Button
│   └── Layout Toggle
└── Legend
    └── Color coding explanation
```

### News Card Component

```
NewsCard
├── Header
│   ├── Source Logo
│   ├── Publish Date
│   └── Category Badge
├── Content
│   ├── Title (Clickable)
│   ├── Summary (2-3 lines)
│   └── Sentiment Indicator
├── Actions
│   ├── Read More → DeepDive
│   ├── Generate Mind Map
│   └── Save to Watchlist
└── Footer
    ├── Share Button
    └── Bookmark
```

---

## 🔒 Security Features

- **Rate Limiting:** 100 requests per 15 minutes per IP
- **CORS:** Whitelist of allowed origins
- **JWT Authentication:** Secure token-based auth
- **Input Validation:** Sanitize all user inputs
- **Environment Variables:** Sensitive data in .env files

---

## 📈 Performance Optimizations

- **Frontend:**
  - Code splitting by routes
  - Lazy loading of heavy components
  - Memoization with useMemo/useCallback
  - Optimistic UI updates

- **Backend:**
  - MongoDB caching
  - Response compression
  - Connection pooling
  - Batch API requests

---

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm run lint
```

---

## 📝 Environment Variables

### Backend (.env)

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/etgenai
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
NEWS_API_KEY=your_news_api_key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful UI components
- **Groq** for fast LLM inference
- **Google Gemini** for AI mind map generation
- **Vercel** for deployment platform
- **Firebase** for authentication and storage

---

## 📞 Support

For support, email support@etgenai.com or join our Discord channel.

---

## 🔗 Related Links

- [Documentation](https://docs.etgenai.com)
- [API Reference](https://api.etgenai.com)
- [Live Demo](https://etgenai1.vercel.app)
- [Changelog](./CHANGELOG.md)

---

<div align="center">
  <strong>Built with ❤️ for retail investors worldwide</strong>
  <br>
  <sub>© 2025 ET Gen AI. All rights reserved.</sub>
</div>