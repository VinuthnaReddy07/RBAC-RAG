from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import (
    users_db,
    create_token,
)
from app.auth import verify_token

from app.models import QueryRequest


from app.rag import ask_rag

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "RBAC-RAG API"}

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    user = users_db.get(form_data.username)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User Not Found"
        )

    if user["password"] != form_data.password:
        raise HTTPException(
            status_code=401,
            detail="Wrong Password"
        )

    token = create_token(
        form_data.username,
        user["role"]
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/ask")
def ask(
    request: QueryRequest,
    user=Depends(verify_token)
):

    role = user["role"]

    response = ask_rag(
        request.query,
        role
    )

    return {
        "role": role,
        "response": response
    }
