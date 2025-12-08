from .models import Users, Subscriptions
from .database import get_db
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