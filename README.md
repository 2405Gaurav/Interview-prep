# 🚀 PREPGT – AI-Powered Technical Interview Ecosystem

## 🌐 Live Application  
**Production URL:** https://prepgt.vercel.app  
**GitHub Repository:** https://github.com/2405Gaurav/prepgt  

---

# 🧠 PREPGT

**PREPGT** is an advanced AI-driven mock interview platform built for technical professionals.  
It combines LLM-based evaluation, structured interview orchestration using **LangGraph + LangChain**, in-browser coding, and behavioral monitoring to simulate real-world technical interviews.

The long-term objective is to integrate PREPGT into a larger **AI-powered Education Ecosystem**, enabling adaptive learning, personalized skill benchmarking, and career readiness intelligence.

---

# 🏗️ System Architecture Overview

PREPGT follows a distributed AI architecture:

- **Frontend** → React-based client with integrated IDE
- **Backend** → Go microservice API layer
- **LLM Orchestration** → LangChain + LangGraph
- **Database** → MongoDB
- **AI Models** → Gemini (evaluation & feedback generation)
- **Monitoring Layer** → MediaPipe fairness detection
- **Deployment** → Vercel (Frontend) + Custom Backend Hosting

---

# 🗂️ Repository Structure

```
.
└── prepgt/
    ├── client/
    │   ├── public/
    │   │   └── mediapipe/
    │   ├── src/
    │   │   ├── assets/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   └── lib/
    │   └── .env
    │
    └── server/
        ├── controllers/
        ├── db/
        ├── models/
        ├── routes/
        ├── utils/
        ├── middleware/
        ├── services/
        ├── langchain/
        ├── graph/
        ├── .env
        └── main.go
```

---

# ⚙️ Core Capabilities

## 1️⃣ AI-Orchestrated Mock Interviews

- Structured interview flow managed using **LangGraph**
- Modular prompt chains via **LangChain**
- Context-aware follow-up questions
- Multi-stage evaluation (technical + behavioral)

---

## 2️⃣ In-Browser Technical IDE

- Real-time coding interface
- Supports algorithmic and system design tasks
- Execution-ready architecture for future sandboxing
- Designed for scalable language support

---

## 3️⃣ LLM-Based Performance Intelligence

- AI-generated structured feedback
- Categorized strengths & weaknesses
- Improvement roadmap generation
- Technical depth analysis
- Communication assessment

---

## 4️⃣ Fairness & Attention Detection

- Integrated **MediaPipe**
- Face tracking & attention monitoring
- Interview integrity enhancement
- Non-invasive behavior analytics

---

## 5️⃣ Modular AI Evaluation Pipeline

Built using:

- Prompt Templates
- Retrieval-Augmented Context
- Multi-node Graph Execution
- State Management Across Interview Phases
- Expandable Evaluation Agents

---

# 🧩 Tech Stack

## Frontend
- React
- Vite
- TailwindCSS
- MediaPipe
- Framer Motion

## Backend
- Go (Golang)
- REST APIs
- MongoDB
- JWT Authentication

## AI Layer
- LangChain
- LangGraph
- Google Gemini API
- Custom Evaluation Chains

## Deployment
- Vercel (Frontend)
- Scalable Backend Hosting
- Environment-Based Configuration

---

# 🔬 AI Workflow Design (LangGraph Driven)

Interview execution follows a graph-based flow:

```
Start
  ↓
Resume Analysis
  ↓
Technical Question Generation
  ↓
Answer Evaluation
  ↓
Follow-up Question Node
  ↓
Behavioral Assessment
  ↓
Report Generation
  ↓
End
```

Each node:
- Maintains structured state
- Passes contextual memory
- Generates deterministic evaluation outputs

This architecture allows:
- Future agent-based specialization
- Multi-model orchestration
- Integration with RAG systems

---

# 📊 Future Expansion Roadmap

PREPGT is architected as a foundational module of a broader **AI Education Ecosystem**, which aims to include:

- 📚 Adaptive Learning Paths
- 🧠 Skill Gap Analytics
- 📈 Personalized Curriculum Builder
- 🧪 AI-Based Project Evaluator
- 🧾 Resume Intelligence Engine
- 🔁 Continuous Competency Tracking
- 🎓 Institution-Level Analytics Dashboard

Long-term goal:
Create a unified AI-powered education + interview readiness infrastructure.

---

# 🛠️ Local Development Setup

## Prerequisites

- Node.js v20+
- Go 1.20+
- MongoDB
- Gemini API Key

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/2405Gaurav/prepgt.git
cd prepgt
```

---

## 2️⃣ Backend Configuration

Create `.env` in `/server`:

```
PORT=
MONGODB_URI=""
DB_NAME=""
SESSION_COLLECTION_NAME=""
QUESTION_COLLECTION_NAME=""
GEMINI_API_KEY=""
FRONTEND_URL="http://localhost:5173"
```

Run backend:

```bash
cd server
go run main.go
```

Optional (with hot reload):

```bash
nodemon --exec go run main.go --signal SIGTERM
```

---

## 3️⃣ Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Access locally:

```
http://localhost:5173
```

---

# 🔐 Security & Scalability Considerations

- Environment-based configuration
- Secure API key handling
- Stateless backend design
- Extensible AI pipeline
- Modular evaluation components
- Microservice-friendly structure

---

# 📌 Project Vision

PREPGT is not just a mock interview tool.

It is an AI-first infrastructure layer for:
- Skill validation
- Structured evaluation
- Career readiness measurement
- Data-driven education systems

The system is designed to evolve into a multi-agent educational intelligence platform powered by graph-based AI orchestration.

---

# 📜 License

MIT License

---

# 👨‍💻 Author

**Gaurav Thakur**  
AI/ML Engineer | Backend Systems | AI Orchestration Architect  
GitHub: https://github.com/2405Gaurav  
Live: https://prepgt.vercel.app

---
