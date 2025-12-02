from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def hash_password(user_pwd: str):
    return pwd_context.hash(user_pwd)


async def verify_password(user_pwd: str, hashed_pwd: str):
    return pwd_context.verify(user_pwd, hashed_pwd)




async def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.now() + timedelta(
        minutes=settings.ACCEESS_TOKEN_EXPIRE_MINUTES
    )
    token = jwt.encode(
        to_encode, key=settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return token


async def create_refresh_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.now() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    token = jwt.encode(
        to_encode, key=settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    
    return token
