from datetime import timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status
from ..dependancy import get_superuser
from ..database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import (
    Users,
    Attendance,
    Subscriptions,
    SubscriptionPlans,
    Payment,
    DailySubscriptions,
)
from sqlalchemy import and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# number of active users, number of trainers, today's attendance
@router.get(
    "/user-stats", status_code=status.HTTP_200_OK
)  
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db), superuser: Users = Depends(get_superuser)
):
    response = []

    result1 = await db.execute(
        select(func.count(Users.id)).where(
            and_(
                Users.is_active == True,
                Users.role == "client",
                Users.is_superuser == False,
            )
        )
    )
    total_active_users = result1.scalar()

    result2 = await db.execute(
        select(func.count(Users.id)).where(Users.role == "trainer")
    )
    total_trainers = result2.scalar()

    result3 = await db.execute(
        select(func.count(Attendance.id)).where(Attendance.date == func.current_date())
    )
    today_attendance = result3.scalar()

    response.append(
        {
            "total_active_users": total_active_users,
            "total_trainers": total_trainers,
            "today_attendance": today_attendance,
        }
    )
    return response


@router.get("/subscription/stats", status_code=status.HTTP_200_OK)
async def get_subscription_stats(
    db: AsyncSession = Depends(get_db), superuser: Users = Depends(get_superuser)
):
    response = []

    result1 = await db.execute(
        select(func.count(Subscriptions.id)).where(Subscriptions.is_active == True)
    )
    total_active_subscriptions = result1.scalar()

    result = await db.execute(
        select(SubscriptionPlans.type, func.count(Subscriptions.id))
        .outerjoin(Subscriptions, Subscriptions.plan_id == SubscriptionPlans.id)
        .where(Subscriptions.is_active == True)
        .group_by(SubscriptionPlans.type)
    )

    type_and_count = result.all()
    for type, count in type_and_count:
        response.append(
            {
                "type": type,
                "count": count,
                "percentage": (100 * count) // total_active_subscriptions,
            }
        )

    response.append(
        {
            "total_active_subscriptions": total_active_subscriptions,
        }
    )

    return response


# total profit for a day, daily clients, weekly clients
# TO DO: cache the response for 10 minustes
@router.get("/subscription/payment")
async def get_total_profit_for_day(db: AsyncSession = Depends(get_db)):
    result1 = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.payment_date == date.today())
    )

    result2 = await db.execute(
        select(func.count(DailySubscriptions.id)).where(
            DailySubscriptions.subscription_date == date.today()
        )
    )

    start_date = date.today() - timedelta(days=7)
    end_date = date.today() - timedelta(days=1)

    result3 = await db.execute(
        select(func.count(DailySubscriptions.id))
        .where(DailySubscriptions.subscription_date.between(start_date, end_date))
        .group_by(func.date(DailySubscriptions.subscription_date))
    )

    weekly_visits = result3.scalars().all()
    length = len(weekly_visits)
    weekly_clients = []
    for i in range(length):
        day = (date.today() - timedelta(days=length - i)).strftime("%A")
        weekly_clients.append({"day": day, "count": weekly_visits[i]})

    daily_visits = result2.scalars().first()
    daily_profit = result1.scalars().first()

    response = {
        "weekly_clients": weekly_clients,
        "daily_profit": daily_profit or 0,
        "daily_clients": daily_visits or 0,
    }
    return response


@router.get("/notifications")
async def get_ended_subscriptions(db: AsyncSession = Depends(get_db)):
    cutoff = [date.today() + timedelta(days=i) for i in range(1, 4)]
    result = await db.execute(
        select(Subscriptions)
        .options(selectinload(Subscriptions.user))
        .where(Subscriptions.end_date.in_(cutoff))
    )
    subscriptions = result.scalars().all()

    response = []

    for s in subscriptions:
        days_left = (s.end_date - date.today()).days
        status = "Tugagan" if days_left <= 0 else "Yakunlanmoqda"
        response.append(
            {
                "user_id": s.user_id,
                "first_name": s.user.first_name,
                "last_name": s.user.last_name,
                "phone_number": s.user.phone_number,
                "days_left": days_left,
                "status": status,
            }
        )

    return response
