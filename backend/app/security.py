from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from .config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def hash_password(user_pwd: str) -> str:
    return pwd_context.hash(user_pwd)


async def verify_password(user_pwd: str, hashed_pwd: str) -> bool:
    return pwd_context.verify(user_pwd, hashed_pwd)


async def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    token = jwt.encode(
        to_encode, key=settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return token


async def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    token = jwt.encode(
        to_encode, key=settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )

    return token


async def verify_token(token: str):
    try:
        payload = jwt.decode(
            token, key=settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        phone_number = payload.get("phone_number")
        role = payload.get("role")

        if phone_number is None or role is None:
            raise Exception("Invalid token payload")

        access_token = await create_access_token(
            {"phone_number": phone_number, "role": role}
        )
        return access_token
    except Exception:
        return None
