from fastapi import APIRouter, Depends, HTTPException, status
from ..dependancy import get_superuser
from ..database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Users, Attendance, Subscriptions, SubscriptionPlans
from sqlalchemy import and_
from sqlalchemy.future import select
from sqlalchemy import func

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/user-stats/", status_code=status.HTTP_200_OK) # number of active users, number of trainers, today's attendance
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


    response.append(
        {
            "total_active_subscriptions": total_active_subscriptions,
            "total_subscription_plans": total_subscription_plans,
        }
    )

    return response