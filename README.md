<div align="center">

# IELTS Prep App

**A modern, full-stack IELTS preparation platform with grammar mastery, practice tests, and progress tracking.**

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

</div>

---

## What Is This?

An IELTS learning app built for students who want structured grammar practice with real feedback. Features sequential chapter unlocking, a mistake notebook that learns from your errors, and a full admin panel for content management.

## What You'll Learn

> This project is a reference for building a **full-stack CRUD app** with authentication, role-based access, and a polished mobile-first UI.

| Area | What's Inside |
|------|---------------|
| **Frontend** | React 19 + Vite + TypeScript, Zustand state management, React Router v6, Tailwind CSS v4 with custom design tokens |
| **Backend** | Express.js REST API, Mongoose ODM, JWT authentication, middleware-based role authorization |
| **Database** | MongoDB Atlas with embedded documents (questions inside chapters), indexed queries |
| **Design System** | Material Design 3 inspired tokens, Google Material Symbols, glassmorphism cards, custom animations |
| **Architecture** | Monorepo structure (client / server / shared types), Vercel-ready serverless functions |

---

## Features

### For Students
- **Chapter-based learning** - Grammar topics unlock sequentially as you progress
- **Practice Mode** - Answer questions with instant feedback, explanations, and a green/red streak counter
- **Mock Exams** - Timed 20-question tests with a countdown timer, just like real IELTS
- **Mistake Notebook** - Auto-collects every wrong answer with justification, mark as reviewed when ready
- **Progress Dashboard** - SVG score chart, daily streak, study time, and mastery ring
- **Mobile-first** - Designed for phones, responsive on desktop

### For Admins
- **Chapter Editor** - Create, edit, delete chapters with practice sets and test sets
- **Question Builder** - Add MCQ questions with 4 options, correct answer, and justification
- **Content API** - Full CRUD for chapters, question sets, and individual questions

---

## Tech Stack

```
client/                 server/                  shared/
├── React 19            ├── Express.js           └── TypeScript
├── Vite 8              ├── Mongoose 8               interfaces
├── TypeScript 5        ├── bcryptjs
├── Tailwind CSS 4      ├── jsonwebtoken
├── Zustand             ├── cors
└── React Router 6      └── dotenv
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ielts-prep-app.git
cd ielts-prep-app

# Install dependencies
cd client && npm install
cd ../server && npm install
```

### 2. Environment Setup

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your_random_secret_key_here
PORT=3001
DATABASE_NAME=ielts_prep
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your_secure_password
```

### 3. Seed Database

```bash
cd server
npx tsx seed.ts
```

This creates an admin user and a sample "Present Simple Tense" chapter with 15 MCQ questions.

### 4. Run Development

Open two terminals:

```bash
# Terminal 1 - Server (port 3001)
cd server
npx tsx api/index.ts

# Terminal 2 - Client (port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173** and login with your admin credentials.

---

## Project Structure

```
IELTS/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # All route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ChapterList.tsx
│   │   │   ├── ChapterDetail.tsx
│   │   │   ├── PracticeMode.tsx
│   │   │   ├── TestMode.tsx
│   │   │   ├── TestResult.tsx
│   │   │   ├── ModuleComplete.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Mistakes.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       └── ChapterEditor.tsx
│   │   ├── components/      # Reusable components
│   │   ├── stores/          # Zustand state stores
│   │   ├── lib/             # API client, utilities
│   │   └── types/           # TypeScript interfaces
│   └── index.css            # Tailwind v4 design tokens
│
├── server/                  # Express backend
│   ├── api/                 # Route handlers
│   │   ├── auth.ts          # Register, Login, Me
│   │   ├── chapters.ts      # Chapter list + detail (with unlock logic)
│   │   ├── attempts.ts      # Test/practice submission + scoring
│   │   ├── mistakes.ts      # Mistake notebook CRUD
│   │   ├── analytics.ts     # Visitor tracking
│   │   ├── admin.ts         # Admin chapter CRUD
│   │   └── index.ts         # Express app entry
│   ├── models/              # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Chapter.ts       # Embedded questionSets + questions
│   │   ├── Attempt.ts
│   │   ├── Mistake.ts
│   │   └── Analytics.ts
│   ├── middleware/           # Auth + Admin middleware
│   ├── lib/                 # DB connection, JWT helpers
│   └── seed.ts              # Database seeder
│
└── shared/                  # Shared TypeScript types
    └── types.ts
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user info |
| GET | `/api/chapters` | Yes | List chapters (with unlock status) |
| GET | `/api/chapters/:slug` | Yes | Chapter detail with questions |
| POST | `/api/attempts` | Yes | Submit practice/test, server-side scoring |
| GET | `/api/attempts` | Yes | User attempt history |
| GET | `/api/attempts/stats` | Yes | Aggregated stats |
| GET | `/api/mistakes` | Yes | User's mistake notebook |
| POST | `/api/mistakes/:id/review` | Yes | Mark mistake reviewed |
| DELETE | `/api/mistakes/:id` | Yes | Remove mastered mistake |
| POST | `/api/admin/chapters` | Admin | Create chapter |
| PUT | `/api/admin/chapters/:id` | Admin | Update chapter |
| DELETE | `/api/admin/chapters/:id` | Admin | Delete chapter |

---

## Design System

Built with **Grammar Companion** - a warm, academic design language:

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#00685F` | Teal - buttons, links, active states |
| Secondary | `#FEA619` | Amber - accents, streaks, highlights |
| Background | `#F8F9FA` | Soft gray canvas |
| Font | Inter | Clean, readable at all sizes |
| Icons | Material Symbols Outlined | Consistent icon language |

---

## License

MIT

---

<div align="center">

**Built with care for IELTS learners everywhere.**

</div>
