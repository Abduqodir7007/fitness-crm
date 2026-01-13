from uuid import UUID
from jose import JWTError, jwt

from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .config import settings
from .database import get_db
from .models import Users

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> Users:
    try:
        payload = jwt.decode(
            token, key=settings.JWT_SECRET_KEY, algorithms=settings.JWT_ALGORITHM
        )
        phone_number = payload.get("phone_number")

    except JWTError:
        raise exception

    result = await db.execute(select(Users).where(Users.phone_number == phone_number))
    user = result.scalars().first()

    if user is None:
        raise exception

    return user


async def is_admin(user: Users = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have enough permissions",
        )
    return True


async def get_gym_id(user: Users = Depends(get_current_user)) -> UUID:
    return user.gym_id
