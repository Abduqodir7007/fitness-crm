from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from datetime import timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession

from ..utils import is_subscription_active
from ..dependancy import get_superuser
from ..database import get_db
from ..models import (
    SubscriptionPlans,
    Subscriptions,
    Payment,
    DailySubscriptions,
)
from ..schemas.admin import (
    SubscriptionPlanCreate,
    SubscriptionCreate,
    DailySubscriptionCreate,
    SubscriptionResponse,
)


router = APIRouter(
    prefix="/admin", tags=["Admin"], dependencies=[Depends(get_superuser)]
)


@router.post("/subscription_plans", status_code=status.HTTP_201_CREATED)
async def create_subscription_plan(
    subscription: SubscriptionPlanCreate,
    db: AsyncSession = Depends(get_db),
):

    new_plan = SubscriptionPlans(
        type=subscription.name,
        price=subscription.price,
        duration_days=subscription.duration_days,
    )
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    return new_plan


@router.get("/subscription_plans", response_model=list[SubscriptionResponse])
async def get_subscription_plans(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SubscriptionPlans).where(SubscriptionPlans.is_active == True)
    )
    plans = result.scalars().all()

    return plans

# do not used
@router.put("/subscription_plans/deactivate/{plan_id}", status_code=status.HTTP_200_OK)
async def deactivate_subscription_plan(
    plan_id: str, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SubscriptionPlans).where(SubscriptionPlans.id == plan_id)
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )
    plan.is_active = False
    db.add(plan)
    await db.commit()
    return {"message": "Subscription plan deactivated successfully"}


@router.put("/subscription_plan/update/{plan_id}", status_code=status.HTTP_200_OK)
async def update_subscription_plan(
    plan_id: str,
    subscription: SubscriptionPlanCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SubscriptionPlans).where(SubscriptionPlans.id == plan_id)
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )

    plan.type = subscription.name
    plan.price = subscription.price
    plan.duration_days = subscription.duration_days
    db.add(plan)
    await db.commit()
    return {"message": "Subscription plan updated successfully"}


@router.delete("/subscription_plans/{plan_id}", status_code=status.HTTP_200_OK)
async def delete_subscription_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SubscriptionPlans).where(SubscriptionPlans.id == plan_id)
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )
    await db.delete(plan)
    await db.commit()
    return {"message": "Subscription plan deleted successfully"}


@router.post("/subscriptions/assign", status_code=status.HTTP_200_OK)
async def subscriptions_assign(
    subscription: SubscriptionCreate, db: AsyncSession = Depends(get_db)
):

    is_active = await is_subscription_active(subscription.user_id, db)
    if is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription",
        )

    new_subscription = Subscriptions(
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        payment_method=subscription.payment_method,
        trainer_id=subscription.trainer_id,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
    )
    result = await db.execute(
        select(SubscriptionPlans).where(SubscriptionPlans.id == subscription.plan_id)
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )

    payment = Payment(
        user_id=subscription.user_id,
        amount=plan.price,
        payment_method=subscription.payment_method,
    )

    db.add(new_subscription)
    db.add(payment)
    await db.commit()
    return {"message": "Subscription assigned successfully"}


@router.post("/subscriptions/assign/daily", status_code=status.HTTP_200_OK)
async def daily_subscriptions_assign(
    subscription: DailySubscriptionCreate, db: AsyncSession = Depends(get_db)
):

    is_active = await is_subscription_active(subscription.user_id, db)
    if is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription",
        )

    daily_sub = DailySubscriptions(
        user_id=subscription.user_id,
        amount=subscription.amount,
    )

    payment = Payment(
        user_id=subscription.user_id,
        amount=subscription.amount,
        payment_method=subscription.payment_method,
    )
    db.add(daily_sub)
    db.add(payment)
    await db.commit()
    return {"message": "Daily Subscription assigned successfully"}
