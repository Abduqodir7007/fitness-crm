import logging
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..logging_config import setup_logging
from ..rate_limiter import rate_limiter
from ..dependancy import get_gym_id
from ..utils import is_subscription_active, check_gym_active
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

setup_logging()
logger = logging.getLogger(__name__)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limiter)],
)
async def register(
    user_in: UserCreate, gym_id=Depends(get_gym_id), db: AsyncSession = Depends(get_db)
):
    logger.info(f"Registering user with phone number: {user_in.phone_number}")
    result = await db.execute(
        select(Users).where(Users.phone_number == user_in.phone_number)
    )
    user = result.scalars().first()
    if user:
        logger.warning(
            f"User registration failed. Phone number already exists: {user_in.phone_number}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this phone number already exists",
        )

    hashed_password = await hash_password(user_in.password)
    
    logger.info(f"Password hashed successfully for phone number")
   
    user_data = user_in.model_dump(exclude={"password"})

    hashed_password = await hash_password(user_in.password)

    user_data.update({"hashed_password": hashed_password, "gym_id": gym_id})

    logger.info(f"Creating new user with phone number: {user_in.phone_number}")

    new_user = Users(**user_data)

    db.add(new_user)
    await db.commit()
    
    logger.info(
        f"User registered successfully with phone number: {user_in.phone_number}"
    )
    return {"message": "User registered successfully"}


@router.post("/login", status_code=status.HTTP_200_OK, response_model=Token)
async def login_user(
    user_in: UserLogin,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Users).where(Users.phone_number == user_in.phone_number.strip())
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            detail="User does not exists", status_code=status.HTTP_400_BAD_REQUEST
        )

    if user.role != "super-admin" and user.gym_id:
        is_gym_active = await check_gym_active(user.gym_id, db)
        if not is_gym_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Zal nofaol holatda. Iltimos, administrator bilan bog'laning.",
            )

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
