from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status
from ..dependancy import get_superuser
from ..database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Users, Attendance, Subscriptions, SubscriptionPlans
from sqlalchemy import and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/user-stats", status_code=status.HTTP_200_OK
)  # number of active users, number of trainers, today's attendance
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
        print(days_left)

    return response
