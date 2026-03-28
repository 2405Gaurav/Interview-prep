# ⚡ InterviewPrep.AI

> AI-powered mock interview platform that reads your resume, asks questions tailored to *you*, monitors your focus, and delivers structured feedback — all in one session.

🌐 **[prepai.thegauravthakur.in](https://prepai.thegauravthakur.in)** &nbsp;·&nbsp; [GitHub](https://github.com/2405Gaurav/prepgt)

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🧠 | **AI-Personalised Interviews** | Gemini reads your resume and crafts questions specific to your stack, experience level, and projects |
| 🎙️ | **Voice + Code Responses** | Answer verbally via speech-to-text or through the built-in code editor for DSA rounds |
| 👁️ | **Live Proctoring** | MediaPipe tracks face and attention — flags anomalies without interrupting your flow |
| 📊 | **Structured Feedback** | Post-session report with strengths, weak areas, and a personalised improvement roadmap |
| 🔁 | **Adaptive Follow-ups** | AI adjusts depth and difficulty in real time based on your answers |

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────┐
│                React Frontend                   │
│   Vite · TailwindCSS · Framer Motion · MediaPipe│
└───────────────────┬─────────────────────────────┘
                    │ REST
┌───────────────────▼─────────────────────────────┐
│              Go Backend (main.go)               │
│   Controllers · Routes · Middleware · Services  │
└──────┬────────────────────────────┬─────────────┘
       │                            │
┌──────▼──────┐            ┌────────▼────────┐
│   MongoDB   │            │   Gemini API    │
│  Sessions   │            │  Q&A · Feedback │
│  Questions  │            │  Resume Parsing │
└─────────────┘            └─────────────────┘
```

---

## 🗂️ Project Structure
```
prepgt/
│
├── client/                          # React frontend
│   ├── public/
│   │   └── mediapipe/               # MediaPipe WASM assets
│   └── src/
│       ├── components/
│       │   ├── Camera/              # MediaPipe face tracking
│       │   ├── Interview/           # Core interview UI
│       │   ├── MicroPhone/          # Speech-to-text
│       │   ├── Speaker/             # TTS playback
│       │   └── Ide/                 # In-browser code editor
│       ├── pages/
│       │   ├── Home/
│       │   ├── Details/             # Resume upload + user info
│       │   ├── Interview/
│       │   └── Report/              # Post-session feedback
│       ├── hooks/
│       └── lib/
│
└── server/                          # Go backend
    ├── main.go
    ├── controllers/                 # Request handlers
    ├── routes/                      # API route definitions
    ├── models/                      # MongoDB schemas
    ├── middleware/                  # CORS, auth, logging
    ├── services/                    # Gemini integration
    ├── db/                          # MongoDB connection
    └── utils/                       # Helpers
```

---

## 🧩 Tech Stack

### Frontend
- ⚛️ **React** + **Vite** — fast dev + optimised builds
- 🎨 **TailwindCSS** + **Framer Motion** — UI and animations
- 🎤 **Web Speech API** — browser-native speech-to-text
- 👁️ **MediaPipe** — real-time face mesh and attention tracking
- 🖥️ **Monaco-style IDE** — in-browser code editor

### Backend
- 🐹 **Go (Golang)** — high-performance REST API
- 🍃 **MongoDB** — session and question persistence
- 🔐 **JWT** — stateless authentication *(coming soon)*
- 🤖 **Google Gemini API** — resume parsing, Q&A generation, feedback

---

## 🚀 Local Setup

**Prerequisites:** Node.js v20+, Go 1.21+, MongoDB, Gemini API Key
```bash
# 1. Clone
git clone https://github.com/2405Gaurav/prepgt.git
cd prepgt

# 2. Backend
cd server
cp .env.example .env        # fill in your values
go run main.go
# → API running at http://localhost:8080

# 3. Frontend (new terminal)
cd ../client
npm install
npm run dev
# → App running at http://localhost:5173
```

### Backend `.env`
```env
PORT=8080
GO_ENV=development

MONGODB_URI=""
DB_NAME=""
SESSION_COLLECTION_NAME=""
QUESTION_COLLECTION_NAME=""

GEMINI_API_KEY=""
FRONTEND_URL="http://localhost:5173"
```

### Frontend `.env`
```env
VITE_SERVER=http://localhost:8080
```

---

## 🔐 Auth & Personalisation *(In Progress)*

The platform is being upgraded from guest-only sessions to a full personalised experience:

- **JWT-based authentication** — secure login with access + refresh tokens
- **User profiles** — track your tech stack, experience level, and interview preferences
- **Session history** — every interview stored, reviewable, and comparable over time
- **Growth dashboard** — visualise your progress across multiple sessions with score trends
- **Personalised difficulty** — AI adjusts question depth based on your historical performance
- **Interview streaks & milestones** — gamified accountability to keep you consistent

---

## 📈 Roadmap

### 🔜 Near-term
- [ ] JWT auth + user accounts
- [ ] Session history and progress tracking
- [ ] Growth dashboard with score trends
- [ ] Code execution sandbox (Judge0 integration)

### 🔮 Long-term
- [ ] Multi-model support (GPT-4o, Claude)
- [ ] Peer mock interviews (P2P matchmaking)
- [ ] Company-specific interview packs
- [ ] Resume intelligence engine
- [ ] Adaptive learning paths between sessions
- [ ] Skill gap analytics + curriculum builder
- [ ] Institution-level analytics dashboard

---

## 📜 License

MIT © [Gaurav Thakur](https://github.com/2405Gaurav)
