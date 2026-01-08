from .models import Subscriptions, Payment
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func


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


async def fetch_profit_from_db(start_date, end_date, db: AsyncSession):

    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.payment_date.between(start_date, end_date)
        )
    )
    profit = result.scalars().first()

    return profit
