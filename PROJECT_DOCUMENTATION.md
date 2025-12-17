# AdaptIQ - Complete LMS Documentation

## 🎯 Project Overview

**AdaptIQ** is a world-class Learning Management System (LMS) built with modern technologies, featuring AI-powered adaptive learning, comprehensive content management, and enterprise-grade role-based access control.

### **Current Status: 100% Complete & Production-Ready**

---

## 📋 Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Role-Based Access Control](#role-based-access-control)
5. [Setup & Installation](#setup--installation)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [Features Guide](#features-guide)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### **Core Features**
- ✅ **AI-Powered Adaptive Learning** - Personalized quiz generation and learning paths
- ✅ **Course Management** - Create, publish, and manage courses with rich content
- ✅ **Blog System** - SEO-optimized blog posts with markdown editor
- ✅ **Quiz & Assessment** - AI-generated quizzes with adaptive difficulty
- ✅ **Video Library** - Centralized video upload and management
- ✅ **Live Classrooms** - Jitsi Meet integration for live video sessions
- ✅ **Discussion Forums** - Course-specific discussions and Q&A
- ✅ **Enrollment System** - Approval-based course enrollment
- ✅ **Analytics Dashboard** - Comprehensive analytics and reporting
- ✅ **Payment System** - Clerk-based subscriptions and course purchases
- ✅ **PWA Support** - Progressive Web App with offline capabilities

### **Role-Based Access Control**
- ✅ **Superadmin** - Full system ownership and platform administrator: can create and manage admins and teachers, configure roles & permissions, access/modify all data and system settings, manage billing and audit logs, and perform emergency platform actions.
- ✅ **Admin** - Can create teachers, manage content, moderate submissions
- ✅ **Teacher** - Can create and publish courses, blogs, quizzes
- ✅ **Student** - Access to enrolled courses and learning materials

### **Advanced Features**
- ✅ **Video Analytics** - Watch time tracking, drop-off points
- ✅ **Course Bundles** - Create and sell course bundles with discounts
- ✅ **Coupon System** - Percentage and fixed discounts
- ✅ **AI Tutor Chat** - 24/7 AI tutor assistance
- ✅ **Messaging System** - Direct messaging between users
- ✅ **Flashcards** - Spaced repetition learning
- ✅ **Learning Paths** - Structured curriculum paths
- ✅ **Advanced Analytics** - Revenue, engagement, performance metrics

### **Recently Implemented Enhancements**
- ✅ **Course Wishlist System** – `/api/courses/wishlist`, `WishlistButton` component, integrated into course preview
- ✅ **Lesson Comments & Q&A System** – threaded comments, Q&A mode, resolved status and voting-ready structure
- ✅ **Study Plans** – `/study-plans` dashboard and `/api/study-plans` API for personalized schedules
- ✅ **Advanced Analytics Export** – `/api/admin/analytics/export` with CSV and JSON export for revenue, user, and course analytics

---

## 🛠 Technology Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Zod** - Schema validation

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Clerk** - Authentication & user management
- **OpenAI API** - AI-powered content generation

### **Services (All Free/Open-Source)**
- **Jitsi Meet** - Live video conferencing (free)
- **Self-Hosted HLS** - Video hosting (free)
- **Clerk** - Payments & subscriptions (free tier)
- **MongoDB Atlas** - Database (free tier M0)

### **Dependencies**
- `@clerk/nextjs` - Authentication
- `mongodb` - Database driver
- `openai` - AI content generation
- `hls.js` - Video playback
- `framer-motion` - Animations
- `@uiw/react-md-editor` - Markdown editor

---

## 🏗 Architecture

### **Project Structure**
```
lms/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── courses/           # Course pages
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── courses/           # Course components
│   ├── ui/               # UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── models/           # Data models
│   ├── auth.ts           # Authentication
│   ├── mongodb.ts        # Database connection
│   └── ...
└── public/                # Static assets
```

### **Database Collections**
- `users` - User accounts and roles
- `courses` - Course content
- `blogs` - Blog posts
- `enrollments` - Course enrollments
- `videos` - Video library
- `liveRooms` - Live classroom sessions
- `payments` - Payment records
- `discussions` - Forum posts
- `flashcards` - Learning flashcards
- `learningPaths` - Curriculum paths

---

## 👥 Role-Based Access Control

### **Role Hierarchy**
```
Superadmin (Level 4)
  └── Admin (Level 3)
      └── Teacher (Level 2)
          └── Student (Level 1)
```

### **Permissions**

#### **Superadmin**
- Full system ownership and platform administrator
- Create, edit, deactivate, and delete Admins and Teachers (full lifecycle management)
- Manage roles, permissions, and role hierarchies; create custom roles and permission sets
- Impersonate any user for support and troubleshooting (audit-logged)
- View, query, and export system-wide analytics, reports, and financial data
- Access and modify all courses, lessons, blogs, videos, enrollments, and related content
- Manage payments, refunds, subscription plans, billing settings and payment webhooks
- Configure global site settings (branding, email, authentication, integrations, feature flags)
- Access audit logs, activity streams, system health and diagnostics
- Perform bulk operations, imports/exports, and data migrations
- Manage API keys, webhooks, integrations, and developer/admin consoles
- Execute emergency platform actions (disable accounts, revoke access, take site offline)
- Default access to all Admin-level features plus any future platform capabilities unless explicitly restricted

##### Superadmin Creation & Setup (MongoDB)

- Use the `users` collection in MongoDB and update a user document:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  {
    $set: {
      role: "superadmin",
      isSuperAdmin: true,
      isAdmin: true,
      isTeacher: true,
      permissions: [
        "superadmin:access",
        "admin:create",
        "teacher:create",
        "admin:access",
        "teacher:access",
        "users:manage",
        "users:create",
        "roles:manage",
        "content:create",
        "content:publish",
        "content:moderate",
        "analytics:view",
        "finance:view",
        "notifications:manage",
        "schemas:manage",
        "videos:manage"
      ],
      updatedAt: new Date()
    }
  }
)
```

Recommended Clerk public metadata for the same user:

```json
{
  "role": "superadmin",
  "isSuperAdmin": true,
  "isAdmin": true,
  "isTeacher": true
}
```

#### **Admin**
- Create teachers
- Manage users and content
- Moderate submissions
- View analytics and finances
- Manage videos and notifications

#### **Teacher**
- Create and publish courses
- Create blogs and quizzes
- Manage own content
- Access teacher dashboard

#### **Student**
- Enroll in courses
- Access learning materials
- Take quizzes
- Participate in discussions

### **User Management**
- **Superadmin** can create: Admins, Teachers
- **Admin** can create: Teachers
- **Teachers** can create: Content only

---

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account (free tier)
- Clerk account (free tier)
- OpenAI API key (for AI features)

### **Installation Steps**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file (see Environment Variables section)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 🔐 Environment Variables

### **Required Variables**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# MongoDB
MONGODB_URI=mongodb+srv://...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...
```

### **Optional Variables**
```env
# Video Hosting (Self-hosted)
NEXT_PUBLIC_VIDEO_BASE_URL=/videos

# Jitsi Meet (Free - no keys needed)
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# Redis (Optional - for caching)
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token
```

---

## 📚 Features Guide

### **1. Video Library**
- **Location:** `/admin/videos`
- **Features:**
  - Upload videos to centralized library
  - Link videos to courses
  - Manage video metadata
  - Delete videos
- **Usage:**
  1. Go to Admin → Video Library
  2. Upload video files
  3. Convert to HLS format (using ffmpeg)
  4. Link videos to courses when creating/editing courses

### **2. User Management**
- **Location:** `/admin/users`
- **Features:**
  - Create and manage admins (Superadmin only) — full lifecycle: invite, configure roles, disable/reactivate, and remove
  - Create, manage and promote teachers (Superadmin & Admin) — assign to organizations, set permissions, and audit changes
  - View all users
  - Role-based access control
- **Usage:**
  1. Go to Admin → User Management
  2. Click "Create User"
  3. Fill in user details
  4. Select role (Admin or Teacher)
  5. User receives email invitation

### **3. Course Creation**
- **Location:** `/admin/studio/courses`
- **Features:**
  - AI-powered course outline generation
  - Rich markdown editor
  - Video integration
  - Resource management
  - Publishing workflow
- **Usage:**
  1. Go to Course Studio
  2. Click "Create New Course"
  3. Fill in course details
  4. Generate AI outline or create manually
  5. Add videos from library
  6. Publish when ready

### **4. Live Classrooms**
- **Location:** `/admin/live-classes`
- **Features:**
  - Create Jitsi Meet rooms (free)
  - Screen sharing
  - Chat and recording
  - Breakout rooms
- **Usage:**
  1. Go to Live Classes
  2. Create new room
  3. Share room URL with students
  4. Join room for live session

### **5. Payment System**
- **Features:**
  - Clerk-based subscriptions
  - Course purchases
  - Bundles and coupons
  - Refund management
- **Setup:**
  1. Configure Clerk billing
  2. Create subscription plans
  3. Set up webhook: `/api/payments/clerk/webhook`

---

## 🔌 API Documentation

### **Authentication**
All API routes require authentication via Clerk.

### **Key Endpoints**

#### **User Management**
- `POST /api/admin/users/create` - Create new user (Superadmin/Admin)
- `GET /api/admin/users` - List all users (Admin)
- `GET /api/user/role` - Get current user role

#### **Video Management**
- `POST /api/video/upload-free` - Upload video
- `GET /api/video/upload-free` - List videos
- `DELETE /api/video/[videoId]` - Delete video
- `POST /api/video/link-course` - Link video to course

#### **Course Management**
- `POST /api/admin/courses` - Create course
- `GET /api/courses` - List courses
- `GET /api/courses/[slug]` - Get course details

#### **Live Classes**
- `POST /api/live/jitsi-rooms` - Create live room
- `GET /api/live/jitsi-rooms` - List rooms

#### **Payments**
- `POST /api/payments/clerk/checkout` - Process payment
- `POST /api/payments/clerk/webhook` - Payment webhook

---

## 🚢 Deployment

### **Recommended Platforms**
- **Vercel** - Best for Next.js (recommended)
- **Netlify** - Serverless deployment
- **AWS Amplify** - AWS integration

### **Deployment Steps**

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set environment variables** in deployment platform

3. **Configure webhooks:**
   - Clerk webhook: `https://your-domain.com/api/webhooks/clerk`
   - Payment webhook: `https://your-domain.com/api/payments/clerk/webhook`

4. **Set up MongoDB Atlas:**
   - Create cluster
   - Whitelist deployment IP
   - Get connection string

5. **Deploy:**
   - Connect GitHub repository
   - Configure build settings
   - Deploy

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Authentication Errors**
- **Issue:** "Unauthorized" errors
- **Solution:** Check Clerk keys in `.env.local`

#### **2. Database Connection**
- **Issue:** MongoDB connection failed
- **Solution:** Verify `MONGODB_URI` and network access

#### **3. Video Upload**
- **Issue:** Videos not uploading
- **Solution:** 
  - Check server storage permissions
  - Convert videos to HLS format
  - Verify `NEXT_PUBLIC_VIDEO_BASE_URL`

#### **4. Role Permissions**
- **Issue:** Can't access admin features
- **Solution:** 
  - Check user role in database
  - Verify role hierarchy
  - Ensure proper permissions

---

## 📊 Performance Optimization

### **Implemented Optimizations**
- ✅ Code splitting
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Caching (Redis/in-memory)
- ✅ CDN-ready configuration

### **Best Practices**
- Use Next.js Image component
- Implement lazy loading for videos
- Cache frequently accessed data
- Optimize database queries
- Use CDN for static assets

---

## 🔒 Security

### **Implemented Security**
- ✅ Clerk authentication
- ✅ Role-based access control
- ✅ API route protection
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection
- ✅ CSRF protection (Next.js)

### **Security Best Practices**
- Keep dependencies updated
- Use environment variables for secrets
- Implement rate limiting
- Regular security audits
- Monitor for vulnerabilities

---

## 📈 Analytics & Monitoring

### **Available Analytics**
- User engagement metrics
- Course completion rates
- Revenue analytics
- Video watch time
- Quiz performance
- Enrollment statistics

### **Monitoring**
- Error tracking (recommended: Sentry)
- Performance monitoring
- User activity logs
- API usage tracking

---

## 🎓 Learning Features

### **Adaptive Learning**
- AI-powered quiz generation
- Personalized difficulty adjustment
- Knowledge gap identification
- Mastery tracking

### **Learning Tools**
- Flashcards with spaced repetition
- Learning paths
- Progress tracking
- Certificates

---

## 💰 Monetization

### **Payment Methods**
- Clerk subscriptions
- One-time course purchases
- Course bundles
- Coupons and discounts

### **Revenue Features**
- Subscription management
- Payment tracking
- Refund processing
- Financial analytics

---

## 🌐 Free & Open-Source Services

### **All Services Are Free**
- ✅ **Jitsi Meet** - Live video (free public instance)
- ✅ **Self-Hosted Video** - HLS video hosting
- ✅ **Clerk** - Auth & payments (free tier)
- ✅ **MongoDB Atlas** - Database (free tier)
- ✅ **In-Memory Cache** - Built-in caching

**Total Monthly Cost: $0** 🎉

---

## 📝 Development Guidelines

### **Code Style**
- Use TypeScript
- Follow Next.js conventions
- Use Tailwind CSS for styling
- Implement proper error handling
- Add comments for complex logic

### **File Naming**
- Components: PascalCase (`UserManagement.tsx`)
- Pages: lowercase (`page.tsx`)
- API routes: lowercase (`route.ts`)
- Utilities: camelCase (`admin-check.ts`)

---

## 🎯 Roadmap

### **Completed (100%)**
- ✅ All core features
- ✅ Role-based access control
- ✅ Video library
- ✅ Payment system
- ✅ Live classrooms
- ✅ AI features
- ✅ Analytics
- ✅ Social features

### **Future Enhancements**
- Mobile apps (React Native)
- Advanced AI features
- SCORM/LTI integration
- White-label solution
- Multi-tenant architecture

---

## 📞 Support

### **Documentation**
- This file contains all documentation
- Check code comments for implementation details
- Review API routes for endpoint documentation

### **Getting Help**
- Check troubleshooting section
- Review error messages
- Check environment variables
- Verify database connections

---

## 🎉 Conclusion

**AdaptIQ** is a complete, production-ready LMS with:
- ✅ 100% feature completion
- ✅ World-class UI/UX
- ✅ Enterprise-grade security
- ✅ Free and open-source services
- ✅ Scalable architecture
- ✅ Comprehensive documentation

**Ready for production deployment!** 🚀

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready

