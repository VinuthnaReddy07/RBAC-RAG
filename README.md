# RBAC RAG

Enterprise-ready role-based access control (RBAC) with retrieval-augmented generation (RAG) for secure document intelligence.

## Overview

This repository contains a full-stack demo application combining:

- `FastAPI` backend for authentication, RBAC enforcement, and RAG query handling
- `React + Vite` frontend for a polished enterprise dashboard and chat experience
- Document access controls scoped by role and department
- Chroma vector store with `sentence-transformers/all-MiniLM-L6-v2` embeddings for retrieval
- `ollama` RAG model `phi3:mini` for secure answer generation

## System Architecture

![Architecture Diagram](./image.png)

## Features

- Role-aware login simulation for Finance, HR, Engineering, Admin, and Executive
- Department-scoped document browsing and search
- RAG chat interface with secure access filtering
- Modular backend with clean FastAPI routes
- Responsive frontend with modern UI styling

## Prerequisites

- Python 3.11+ (recommended)
- Node.js 18+ / npm
- Git

## Run the App

From the repository root:

```powershell
cd C:\Users\mallu\OneDrive\Desktop\RBAC-RAG
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, start the frontend:

```powershell
cd react-frontend
npm install
npm run dev
```

Open the browser at the Vite URL shown in the terminal (typically `http://127.0.0.1:5173`).

## How to Use

1. Launch the backend and frontend servers.
2. Open the React app in the browser.
3. Sign in using one of the simulated roles:
   - `finance_user`
   - `hr_user`
   - `engineering_user`
   - `admin_user`
   - `exec_user`
4. Navigate to the `RAG` page and ask questions about documents in your allowed departments.

## Notes

- The backend currently trusts hard-coded test credentials in `app/auth.py`.
- CORS is configured for local development origins (`http://127.0.0.1:5173`, `http://localhost:5173`, `http://127.0.0.1:3000`, `http://localhost:3000`).
- The frontend query box is rendered at the bottom of the chat panel for better UX.

## Recommended Improvements

- Add production-ready authentication and token refresh
- Store documents and embeddings in a scalable database
- Replace mock role matching with a real user directory
- Add tests for API routes and component behavior

---

Enjoy building secure, role-aware RAG experiences!
