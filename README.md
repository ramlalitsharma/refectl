# 🚀 AdaptiQ - Enterprise Gamified Learning Management System

> **A Next.js-powered LMS featuring Gamification, Social Learning, AI Tutoring, and Real-time Analytics.**

![AdaptiQ Banner](https://placeholder.com/banner.png) 
*(Replace with actual screenshot)*

## 🌟 Overview

AdaptiQ is a modern Learning Management System designed to keep students engaged through **Gamification** (XP, Badges, Leaderboards) and **Social Features** (Friends, Activity Feeds). It leverages **AI** for personalized tutoring and content generation, all while providing enterprise-grade analytics to administrators.

Built over 28 Days as a comprehensive full-stack showcase.

---

## ✨ Key Features

### 🎮 Gamification Engine
- **XP & Leveling System**: Earn experience for every quiz and interactions.
- **Streak & Quests**: Daily challenges to keep retention high.
- **Badge System**: 50+ unique achievements with visual unlocks.
- **Live Leaderboard**: Real-time ranking with "Pass/Overtake" indicators.

### 🧠 AI-Powered Learning
- **Prof. AI Tutor**: Context-aware Chatbot for instant homework help.
- **AI Quiz Generator**: Instantly create 5-question quizzes on any topic using OpenAI.
- **Smart Feedback**: Explanations for every wrong answer.

### 🤝 Social Graph
- **Friend Connections**: Follow classmates and see their progress.
- **Activity Feed**: "User X just earned the Gold Badge!"
- **Profile Customization**: Show off your stats and medals.

### 📊 Enterprise Analytics
- **Teacher Dashboard**: Heatmaps, Mastery Charts, and Trendlines.
- **Reports**: Export user data to JSON/CSV.
- **Moderation**: Report system for user-generated content.

### 💰 Commercialization
- **Subscription Tier**: Free vs Pro ($9.99/mo).
- **Stripe Integration**: Secure checkout flow (with Mock Mode for demos).
- **Feature Gating**: Role-based access control (RBAC).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB (Atlas)
- **Auth**: Clerk (Secure User Management)
- **AI**: OpenAI (GPT-3.5 Turbo)
- **Real-Time**: Smart Polling Hooks
- **DevOps**: Docker, Docker Compose

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (Optional)

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/adaptiq.git
cd adaptiq
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-... (Optional for AI)
RESEND_API_KEY=re_... (Optional for Email)
```

### 3. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🐳 Docker Deployment

AdaptiQ is container-ready.

### Run with Docker Compose
Spins up the App and a local MongoDB instance.
```bash
docker-compose up --build
```

### Production Build
The `Dockerfile` is optimized using Next.js Standalone mode for minimal image size.
```bash
docker build -t adaptiq .
docker run -p 3000:3000 adaptiq
```

---

## 📂 Project Structure

```bash
/app          # Next.js App Router (Pages & API)
  /api        # Backend Endpoints
  /dashboard  # Protected Student/Admin Views
/components   # React UI Components
  /dashboard  # Charts & Widgets
  /ui         # Reusable Atoms (Buttons, Cards)
/lib          # Business Logic (Services)
  /models     # MongoDB Schemas
/hooks        # Custom React Hooks (Polling, Toast)
```

---

## 📄 License

MIT License. Created by [Your Name].
