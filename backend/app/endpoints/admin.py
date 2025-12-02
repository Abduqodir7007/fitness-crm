from fastapi import APIRouter, Depends, HTTPException, status
from dependancy import get_superuser
from database import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import SubscriptionPlans
from schemas.admin import SubscriptionPlanCreate

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=Depends(get_superuser))


@router.post("/subscription_plans", status_code=status.HTTP_201_CREATED)
async def create_subscription_plan(
    subscription: SubscriptionPlanCreate,
    db: AsyncSession = Depends(get_db),
):

    new_plan = SubscriptionPlans(
        name=subscription.name,
        price=subscription.price,
        duration_days=subscription.duration_days,
    )
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    return new_plan


@router.get("/subscription_plans")
async def get_subscription_plans(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SubscriptionPlans).where(SubscriptionPlans.is_active == True)
    )
    plans = result.scalars().all()
    return plans
