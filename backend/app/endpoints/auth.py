from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..rate_limiter import rate_limiter
from ..dependancy import get_superuser, get_gym_id
from ..utils import is_subscription_active
from ..database import get_db
from ..models import Users
from ..schemas.users import (
    UpdateUserInformation,
    UpdateUserPassword,
    UserCreate,
    UserLogin,
    Token,
    RefreshTokenRequest,
)
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)

router = APIRouter(prefix="/auth", tags=["Users"])


@router.post(  # TO DO: implement gym_id assignment
    "/register",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limiter)],
)
async def register(
    user_in: UserCreate, gym_id=Depends(get_gym_id), db: AsyncSession = Depends(get_db)
):

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
        role=user_in.role,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender,
        hashed_password=hashed_password,
        gym_id=gym_id,
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
            "role": user.role,
            "access_token": token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "gym_id": str(user.gym_id) if user.gym_id else None,
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid phone number or password",
    )


@router.delete("/delete/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):

    is_active = await is_subscription_active(user_id, db)
    if is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user with active subscription",
        )

    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}


@router.patch("/update/info")
async def update_user_information(
    user_info: UpdateUserInformation,
    db: AsyncSession = Depends(get_db),
    user: Users = Depends(get_superuser),
):
    result = await db.execute(select(Users).where(Users.id == user_info.user_id))
    user = result.scalars().first()

    if user_info.first_name is not None:
        user.first_name = user_info.first_name

    if user_info.last_name is not None:
        user.last_name = user_info.last_name

    if user_info.phone_number is not None:
        user.phone_number = user_info.phone_number

    await db.commit()
    return {"detail": "User information updated successfully"}


@router.patch("/update/password", status_code=status.HTTP_200_OK)
async def update_user_password(
    password: UpdateUserPassword,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Users).where(Users.id == password.user_id))
    user = result.scalars().first()

    user.hashed_password = await hash_password(password.password)

    await db.commit()
    return {"detail": "Password updated successfully"}


@router.post("/refresh", status_code=status.HTTP_200_OK)
async def get_new_access_token(body: RefreshTokenRequest):
    new_access_token = await verify_token(body.token)
    if new_access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    return {"access_token": new_access_token}
