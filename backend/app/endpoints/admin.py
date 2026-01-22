import logging

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta, date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..logging_config import setup_logging
from ..utils import is_subscription_active
from ..dependancy import is_admin, get_gym_id
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

setup_logging()
logger = logging.getLogger("admin_file")
logger.propagate = True

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(is_admin)])


@router.post(
    "/subscription-plans", status_code=status.HTTP_201_CREATED
)  # change in frontend
async def create_subscription_plan(
    subscription: SubscriptionPlanCreate,
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):

    logger.info(
        "Creating subscription plan: name=%s, gym_id=%s", subscription.name, gym_id
    )
    new_plan = SubscriptionPlans(
        type=subscription.name,
        price=subscription.price,
        duration_days=subscription.duration_days,
        gym_id=gym_id,
    )
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    logger.info("Subscription plan created successfully: id=%s", new_plan.id)
    return new_plan


@router.get(
    "/subscription-plans", response_model=list[SubscriptionResponse]
)  # change in frontend
async def get_subscription_plans(
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    logger.info("Fetching subscription plans for gym_id=%s", gym_id)
    result = await db.execute(
        select(SubscriptionPlans).where(
            SubscriptionPlans.is_active == True, SubscriptionPlans.gym_id == gym_id
        )
    )
    plans = result.scalars().all()
    logger.info("Fetched %d subscription plans for gym_id=%s", len(plans), gym_id)
    return plans


# do not used
# @router.put("/subscription_plans/deactivate/{plan_id}", status_code=status.HTTP_200_OK)
# async def deactivate_subscription_plan(
#     plan_id: str, db: AsyncSession = Depends(get_db)
# ):
#     result = await db.execute(
#         select(SubscriptionPlans).where(SubscriptionPlans.id == plan_id)
#     )
#     plan = result.scalars().first()
#     if not plan:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Subscription plan not found",
#         )
#     plan.is_active = False
#     db.add(plan)
#     await db.commit()
#     return {"message": "Subscription plan deactivated successfully"}


@router.put(
    "/subscription-plans/update/{plan_id}", status_code=status.HTTP_200_OK
)  # change in frontend
async def update_subscription_plan(
    plan_id: str,
    subscription: SubscriptionPlanCreate,
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    logger.info("Updating subscription plan: plan_id=%s, gym_id=%s", plan_id, gym_id)
    result = await db.execute(
        select(SubscriptionPlans).where(
            SubscriptionPlans.id == plan_id, SubscriptionPlans.gym_id == gym_id
        )
    )
    plan = result.scalars().first()
    if not plan:
        logger.warning(
            "Update failed: subscription plan not found (plan_id=%s, gym_id=%s)",
            plan_id,
            gym_id,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )

    plan.type = subscription.name
    plan.price = subscription.price
    plan.duration_days = subscription.duration_days

    db.add(plan)
    await db.commit()
    logger.info("Subscription plan updated successfully: plan_id=%s", plan_id)
    return {"message": "Subscription plan updated successfully"}


@router.delete(
    "/subscription-plans/{plan_id}", status_code=status.HTTP_200_OK
)  # change in frontend
async def delete_subscription_plan(
    plan_id: str, gym_id: str = Depends(get_gym_id), db: AsyncSession = Depends(get_db)
):
    logger.info("Deleting subscription plan: plan_id=%s, gym_id=%s", plan_id, gym_id)
    result = await db.execute(
        select(SubscriptionPlans).where(
            SubscriptionPlans.id == plan_id, SubscriptionPlans.gym_id == gym_id
        )
    )
    plan = result.scalars().first()
    if not plan:
        logger.warning(
            "Delete failed: subscription plan not found (plan_id=%s, gym_id=%s)",
            plan_id,
            gym_id,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )
    await db.delete(plan)
    await db.commit()
    logger.info("Subscription plan deleted successfully: plan_id=%s", plan_id)
    return {"message": "Subscription plan deleted successfully"}


@router.post(
    "/subscription/assign", status_code=status.HTTP_200_OK
)  # change in frontend
async def subscriptions_assign(
    subscription: SubscriptionCreate,
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):

    logger.info(
        "Assigning subscription: user_id=%s, plan_id=%s, gym_id=%s",
        subscription.user_id,
        subscription.plan_id,
        gym_id,
    )
    is_active = await is_subscription_active(subscription.user_id, db)
    if is_active:
        logger.warning(
            "User already has an active subscription: user_id=%s", subscription.user_id
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription",
        )

    result = await db.execute(
        select(SubscriptionPlans).where(SubscriptionPlans.id == subscription.plan_id)
    )
    plan = result.scalars().first()

    if not plan:
        logger.warning("Subscription plan not found: plan_id=%s", subscription.plan_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )
   
    new_subscription = Subscriptions(
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        payment_method=subscription.payment_method,
        trainer_id=subscription.trainer_id,
        gym_id=gym_id,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
    )

    payment = Payment(
        user_id=subscription.user_id,
        amount=plan.price,
        gym_id=gym_id,
        payment_method=subscription.payment_method,
    )

    db.add(new_subscription)
    db.add(payment)
    await db.commit()
    logger.info(
        "Subscription assigned successfully: user_id=%s, plan_id=%s",
        subscription.user_id,
        subscription.plan_id,
    )
    return {"message": "Subscription assigned successfully"}


@router.post("/subscriptions/assign/daily", status_code=status.HTTP_200_OK)
async def daily_subscriptions_assign(
    subscription: DailySubscriptionCreate,
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    logger.info(f"Assigning daily subscription")
    logger.info(f"Checking if user already has an active subscription")

    is_active = await is_subscription_active(subscription.user_id, db)

    if is_active:
        logger.warning(
            f"User already has an active subscription, cannot assign daily subscription"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription",
        )
    logger.info(f"Creating daily subscription and payment records")
    daily_sub = DailySubscriptions(
        user_id=subscription.user_id,
        amount=subscription.amount,
        gym_id=gym_id,
        subscription_date=date.today(),
    )

    payment = Payment(
        user_id=subscription.user_id,
        amount=subscription.amount,
        payment_method=subscription.payment_method,
        gym_id=gym_id,
    )

    db.add(daily_sub)
    db.add(payment)
    await db.commit()

    logger.info(
        "Daily subscription assigned successfully | user_id=%s gym_id=%s date=%s",
        subscription.user_id,
        gym_id,
        daily_sub.subscription_date,
    )

    return {"message": "Daily Subscription assigned successfully"}
