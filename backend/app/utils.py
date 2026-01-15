from .models import Subscriptions, Payment, Gyms
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from fastapi import HTTPException, status, Depends
from .dependancy import get_current_user
from .models import Users


async def is_subscription_active(user_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(Subscriptions).where(
            and_(
                Subscriptions.user_id == user_id,
                Subscriptions.is_active == True,
            )
        )
    )
    subscription = result.scalars().first()
    return subscription is not None


async def fetch_profit_from_db(start_date, end_date, db: AsyncSession, gym_id: str):

    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            and_(
                Payment.payment_date.between(start_date, end_date),
                Payment.gym_id == gym_id,
            )
        )
    )
    profit = result.scalars().first()

    return profit


async def check_gym_active(gym_id: str, db: AsyncSession) -> bool:
    result = await db.execute(select(Gyms).where(Gyms.id == gym_id))

    gym = result.scalars().first()

    if not gym:
        raise HTTPException(
            detail="Gyms does not exits", status_code=status.HTTP_400_BAD_REQUEST
        )

    return gym.is_active


async def is_superuser_exists(db: AsyncSession) -> bool:
    result = await db.execute(select(Users).where(Users.is_superuser == True))
    superuser = result.scalars().first()
    return True if superuser else False
