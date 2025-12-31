from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..rate_limiter import rate_limiter
from ..database import get_db
from ..schemas.users import UserCreate, UserLogin, Token
from ..models import Users
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)

router = APIRouter(prefix="/auth", tags=["Users"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limiter)],
)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(Users).where(Users.phone_number == user_in.phone_number)
    )
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this phone number already exists",
        )
    hashed_password = await hash_password(user_in.password)
    new_user = Users(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone_number=user_in.phone_number,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender,
        hashed_password=hashed_password,
        role=user_in.role,
    )

    db.add(new_user)
    await db.commit()

    return {"message": "User registered successfully"}


@router.post("/login", status_code=status.HTTP_200_OK, response_model=Token)
async def login_user(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Users).where(Users.phone_number == user_in.phone_number.strip())
    )
    user = result.scalars().first()

    if user and await verify_password(user_in.password, user.hashed_password):
        token = await create_access_token(
            {"phone_number": user.phone_number, "role": user.role}
        )
        refresh_token = await create_refresh_token(
            {"phone_number": user.phone_number, "role": user.role}
        )
        return {
            "is_superuser": user.is_superuser,
            "access_token": token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid phone number or password",
    )


@router.post("/refresh", status_code=status.HTTP_200_OK)
async def get_new_access_token(token: str):
    return await verify_token(token)
