from jose import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "mysecretkey"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

users_db = {
    "admin": {
        "password": "admin123",
        "role": "admin"
    },

    "finance": {
        "password": "finance123",
        "role": "finance"
    },

    "hr": {
        "password": "hr123",
        "role": "hr"
    },

    "engineering": {
        "password": "engineering123",
        "role": "engineering"
    }
}

def create_token(username, role):

    token = jwt.encode(
        {
            "sub": username,
            "role": role
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return token

def verify_token(token: str = Depends(oauth2_scheme)):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload

    except:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )