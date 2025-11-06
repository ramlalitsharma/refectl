# Quick Start Guide

Get AdaptIQ running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- npm or yarn
- Accounts for: Clerk, MongoDB Atlas, OpenAI

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create `.env.local` in the root directory:

```env
# Get these from clerk.com dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
CLERK_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Get from mongodb.com/atlas
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
MONGODB_DB_NAME=lms

# Get from platform.openai.com
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Configure Clerk (5 minutes)

1. Go to [clerk.com](https://clerk.com) → Create account → New application
2. Copy your keys to `.env.local`
3. Set URLs in Clerk Dashboard:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in: `/dashboard`
4. Set up webhook (for local dev, use ngrok or deploy first)

## 4. Configure MongoDB (3 minutes)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster (M0)
3. Create database user (save password!)
4. Whitelist IP: `0.0.0.0/0` (or your IP)
5. Get connection string → add to `.env.local`

## 5. Get OpenAI Key (2 minutes)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account, add payment method
3. Create API key → add to `.env.local`

## 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 7. Test It!

1. Click "Get Started Free" → Sign up
2. Go to Dashboard
3. Start an adaptive quiz
4. Answer questions → Watch difficulty adapt!

## 🎉 You're Done!

For detailed setup, see [SETUP.md](./SETUP.md)

For production deployment, see [README.md](./README.md)

