# InterviewPrep.AI

**AI-powered mock interview platform for technical professionals.**  
Live resume parsing → adaptive AI questioning → real-time proctoring → structured feedback report.

🌐 **[prepai.thegauravthakur.in](https://prepai.thegauravthakur.in)** · [GitHub](https://github.com/2405Gaurav/prepgt)

---

## What It Does

- **AI-orchestrated interviews** — LangGraph manages the interview flow with context-aware follow-ups across technical and behavioral rounds
- **Resume-aware questioning** — Gemini parses your resume and tailors questions to your actual experience and stack
- **In-browser code editor** — Integrated IDE for DSA and system design rounds
- **Fairness monitoring** — MediaPipe tracks attention and flags behavioral anomalies without interrupting the session
- **Structured feedback** — AI-generated report with strengths, weaknesses, and an improvement roadmap

---

## Architecture
```
Frontend (React + Vite)
        ↓
Backend (Go REST API)
        ↓
LangGraph Interview Flow
   ├── Resume Analysis
   ├── Question Generation
   ├── Answer Evaluation
   ├── Follow-up Node
   ├── Behavioral Assessment
   └── Report Generation
        ↓
MongoDB · Gemini API · MediaPipe
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TailwindCSS, Framer Motion, MediaPipe |
| Backend | Go, REST APIs, MongoDB |
| AI | LangChain, LangGraph, Google Gemini API |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure
```
prepgt/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── lib/
└── server/
    ├── controllers/
    ├── routes/
    ├── models/
    ├── langchain/
    ├── graph/
    └── main.go
```

---

## Local Setup

**Prerequisites:** Node.js v20+, Go 1.20+, MongoDB, Gemini API Key
```bash
# Clone
git clone https://github.com/2405Gaurav/prepgt.git
cd prepgt

# Backend
cd server
cp .env.example .env   # fill in your values
go run main.go

# Frontend
cd ../client
npm install
npm run dev
# → http://localhost:5173
```

**Backend `.env`**
```
PORT=8080
MONGODB_URI=""
DB_NAME=""
SESSION_COLLECTION_NAME=""
QUESTION_COLLECTION_NAME=""
GEMINI_API_KEY=""
FRONTEND_URL="http://localhost:5173"
```

---

## Roadmap

- [ ] Code execution sandbox
- [ ] Multi-model support (GPT-4, Claude)
- [ ] Adaptive learning paths
- [ ] Skill gap analytics
- [ ] Institution-level dashboard
- [ ] Resume intelligence engine

---

## License

MIT · Built by [Gaurav Thakur](https://github.com/2405Gaurav)
