from jose import jwt 
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from datetime import *
from fastapi import Header, HTTPException

load_dotenv()

jwt_secret_key = os.getenv("JWT_SECRET")
voice_webhook_secret = os.getenv("VOICE_WEBHOOK_SECRET")

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd.hash(password) 

def verify_password(password: str, hashed_password):
    return pwd.verify(password, hashed_password)

def create_token(user_id, role="patient"):
    return jwt.encode(
        {"user_id": user_id, "role": role, "exp": datetime.utcnow() + timedelta(minutes=30), "type": "access"},
        jwt_secret_key,
        algorithm="HS256"
    )

def create_refresh_token(user_id, role="patient"):
    return jwt.encode(
        {"user_id": user_id, "role": role, "exp": datetime.utcnow() + timedelta(days=7), "type": "refresh"},
        jwt_secret_key,
        algorithm="HS256"
    )

def verify_token(token):
    return jwt.decode(token, jwt_secret_key, algorithms=["HS256"])

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]

    try:
        return verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_staff(authorization: str = Header(None)):
    user = get_current_user(authorization)

    if user.get("role") != "staff":
        raise HTTPException(status_code=403, detail="Staff access required")

    return user

def verify_voice_secret(x_voice_secret: str = Header(None)):
    if not voice_webhook_secret or x_voice_secret != voice_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
