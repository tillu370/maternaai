🧠 Materna AI
AI-Powered Maternal Outreach Intelligence Platform

Materna AI is a full-stack AI application designed to help NGOs and public health organizations identify, rank, and strategize maternal healthcare outreach channels across districts.

Built during AI4VIZAG Buildathon.

🎯 Problem

Maternal healthcare outreach planning is:

Manual and time-consuming

Data fragmented across regions

Lacking intelligence-based prioritization

Difficult to scale across districts

Planning outreach for one district can take 2–3 weeks.

💡 Solution

Materna AI:

🔍 Auto-discovers hospitals, PHCs, NGOs

📊 Ranks them using relevance scoring

🤖 Uses AI to generate structured outreach insights

💬 Includes a context-aware assistant

Planning time reduced from weeks → minutes

🏗️ Architecture
React (Vite)
    ↓
Node.js Backend (Express)
    ↓
Gemini AI API
    ↓
Supabase (Auth + Database)

Frontend: Vercel
Backend: Render
Database: Supabase

⚙️ Tech Stack
Frontend

React + TypeScript

Vite

Tailwind CSS

Framer Motion

Backend

Node.js

Express

Gemini API (Google AI)

dotenv

Database & Auth

Supabase

Deployment

Vercel (Frontend)

Render (Backend)

🧠 AI Implementation

Structured system prompt injection

JSON-based output formatting

Context injection from recommendation engine

Relevance scoring logic

Error handling & fallback responses

Average response time: 3–8 seconds
