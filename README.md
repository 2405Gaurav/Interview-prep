# TechPrep-AI

**TechPrep-AI** is a mock interview platform designed to help tech professionals prepare for technical interviews. It features an in-browser IDE, fairness detection using MediaPipe, and detailed performance reports for continuous improvement.

---

## Repository Structure

```
.
└── TechPrep-AI/
├── client/
│ ├── public
│ ├── src/
│ │ ├── assets
│ │ ├── components
│ │ └── lib
│ └── .env
└── server/
├── controllers
├── db
├── models
├── routes
├── utils
├── .env
└── main.go
```

---

## Features

1. **Interactive Mock Interview Platform**:

    - In-browser IDE for solving technical tasks.
    - React-based frontend for a seamless user experience.

2. **Fairness Detection**:

    - Utilizes MediaPipe to monitor candidate focus during interviews.

3. **Performance Reports**:
    - Generates detailed reports highlighting positives, negatives, and improvement areas.

---

## Getting Started

### Prerequisites

-   **Frontend**: Node.js (v20+ recommended).
-   **Backend**: Go (1.20+ recommended).

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/rnkp755/techPrepAI.git
    cd techPrepAI
    ```
2. Run the backend server:
    ```bash
      cd server
      go run main.go
    ```
3. Install dependencies for the frontend:
    ```bash
      cd ../client
      npm install
      npm run dev
    ```
4. Access the application in your browser at `http://localhost:5173`.
