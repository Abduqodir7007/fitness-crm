from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from fastapi import HTTPException, status
from datetime import date, datetime, timedelta

from .models import Subscriptions, Payment, Gyms, Users



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

async def cache_time_for_linegraph(db: AsyncSession) -> int:

    now = datetime.now()

    midnight = (now + timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    remaining_seconds = int((midnight - now).total_seconds())
    return remaining_seconds


async def cache_time_for_barchart(db: AsyncSession) -> int:
    pass # TO DO: calculate cache time until the end of the month
