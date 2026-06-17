from jose import jwt 
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

jwt_secret_key = os.getenv("JWT_SECRET")

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd.hash(password) 

def verify_password(password: str, hashed_password):
    return pwd.verify(password, hashed_password)

def create_token(user_id):
    return jwt.encode(
        {"user_id": user_id},
        jwt_secret_key,
        algorithm="HS256"
    )
    
def verify_token(token):
    return jwt.decode(token, jwt_secret_key, algorithms=["HS256"])