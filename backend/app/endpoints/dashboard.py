import logging
from ..logging_config import setup_logging

import json
import io

from openpyxl import Workbook
from openpyxl.styles import Font

from datetime import timedelta, date
from dateutil.relativedelta import relativedelta
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

from ..utils import fetch_profit_from_db, cache_time_for_linegraph
from ..dependancy import get_gym_id
from ..config import settings
from ..database import get_db
from ..schemas.admin import PaymentResponse
from ..rate_limiter import redis
from ..models import (
    Users,
    Attendance,
    Subscriptions,
    SubscriptionPlans,
    Payment,
    DailySubscriptions,
)

setup_logging()
logger = logging.getLogger("dashboard")
logger.propagate = True

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# number of active users, number of trainers, today's attendance
@router.get("/user-stats", status_code=status.HTTP_200_OK)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    gym_id: str = Depends(get_gym_id),
):
    logger.info("Fetching dashboard user stats for gym_id=%s", gym_id)
    response = []

    result1 = await db.execute(
        select(func.count(Users.id)).where(
            and_(
                Users.role == "client",
                Users.is_superuser == False,
                Users.gym_id == gym_id,
            )
        )
    )
    total_active_users = result1.scalar()

    result2 = await db.execute(
        select(func.count(Users.id)).where(
            and_(Users.role == "trainer", Users.gym_id == gym_id)
        )
    )
    total_trainers = result2.scalar()

    result3 = await db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.date == func.current_date(), Attendance.gym_id == gym_id
        )
    )
    today_attendance = result3.scalar()

    response.append(
        {
            "total_active_users": total_active_users,
            "total_trainers": total_trainers,
            "today_attendance": today_attendance,
        }
    )
    logger.info("User stats: %s", response)
    return response


@router.get("/subscription/stats", status_code=status.HTTP_200_OK)
async def get_subscription_stats(
    db: AsyncSession = Depends(get_db), gym_id: str = Depends(get_gym_id)
):

    logger.info("Fetching subscription stats for gym_id=%s", gym_id)
    response = []

    result1 = await db.execute(
        select(func.count(Subscriptions.id)).where(
            and_(Subscriptions.is_active == True, Subscriptions.gym_id == gym_id)
        )
    )
    total_active_subscriptions = result1.scalar()

    result = await db.execute(
        select(SubscriptionPlans.type, func.count(Subscriptions.id))
        .outerjoin(Subscriptions, Subscriptions.plan_id == SubscriptionPlans.id)
        .where(Subscriptions.is_active == True, Subscriptions.gym_id == gym_id)
        .group_by(SubscriptionPlans.type)
    )

    type_and_count = result.all()
    for type, count in type_and_count:
        response.append(
            {
                "type": type,
                "count": count,
                "percentage": (
                    (100 * count) // total_active_subscriptions
                    if total_active_subscriptions
                    else 0
                ),
            }
        )

    response.append(
        {
            "total_active_subscriptions": total_active_subscriptions,
        }
    )
    logger.info("Subscription stats: %s", response)
    return response


# total profit for a day, daily clients, weekly clients
@router.get("/subscription/payment")
async def get_total_profit_for_day(
    db: AsyncSession = Depends(get_db), gym_id: str = Depends(get_gym_id)
):

    logger.info("Fetching total profit and daily/weekly clients for gym_id=%s", gym_id)
    result2 = await db.execute(
        select(func.count(DailySubscriptions.id)).where(
            DailySubscriptions.subscription_date == date.today(),
            DailySubscriptions.gym_id == gym_id,
        )
    )

    daily_visits = result2.scalars().first()

    response = {
        "daily_clients": daily_visits or 0,
    }

    weekly_clients = await redis.get(str(gym_id))

    if weekly_clients:
        logger.info("Cache hit for weekly_clients: %s", weekly_clients)
        response["weekly_clients"] = json.loads(weekly_clients)
        return response

    start_date = date.today() - timedelta(days=7)
    end_date = date.today() - timedelta(days=1)

    result3 = await db.execute(
        select(
            func.date(DailySubscriptions.subscription_date),
            func.count(DailySubscriptions.id),
        )
        .where(
            and_(
                DailySubscriptions.subscription_date.between(start_date, end_date),
                DailySubscriptions.gym_id == gym_id,
            )
        )
        .group_by(DailySubscriptions.subscription_date)
    )

    weekly_visits = result3.mappings().all()
    db_map = {row["date"]: row["count"] for row in weekly_visits}

    weekly_clients_list = []
    while start_date <= end_date:
        weekly_clients_list.append(
            {"day": start_date.strftime("%A"), "count": db_map.get(start_date, 0)}
        )
        start_date += timedelta(days=1)

    response["weekly_clients"] = weekly_clients_list

    ttl = await cache_time_for_linegraph(db)

    await redis.set(
        str(gym_id),
        json.dumps(weekly_clients_list),
        ex=ttl,  # cached until midnight
    )
    logger.info("Total profit and clients response")
    return response


# Bar chart endpoint
@router.get("/monthly/payment")
async def get_monthly_payment_history(
    db: AsyncSession = Depends(get_db), gym_id: str = Depends(get_gym_id)
):

    # response = await redis.get(settings.MONTHLY_PROFIT)

    # if response:
    #     # print("Cache hit")
    #     return json.loads(response)

    logger.info("Fetching monthly payment history for gym_id=%s", gym_id)
    today = date.today()
    start_date = today.replace(day=1) - relativedelta(months=5)
    end_date = today.replace(day=1) - relativedelta(days=1)

    result = await db.execute(
        select(Payment)
        .where(
            Payment.payment_date.between(start_date, end_date), Payment.gym_id == gym_id
        )
        .order_by(Payment.payment_date)
    )

    payments = result.scalars().all()

    monthly_profit = {}
    for payment in payments:
        # Use year-month as key for proper chronological sorting
        month_key = payment.payment_date.strftime("%Y-%m")
        month_name = payment.payment_date.strftime("%B")
        if month_key not in monthly_profit:
            monthly_profit[month_key] = {"name": month_name, "profit": 0}
        monthly_profit[month_key]["profit"] += payment.amount or 0

    # Sort by year-month key (chronological order)
    sorted_months = sorted(monthly_profit.items(), key=lambda x: x[0])

    response = [
        {"month": data["name"], "profit": data["profit"]} for _, data in sorted_months
    ]
    logger.info("Monthly payment history: %s", response)
    return response


@router.get("/notifications")
async def get_ended_subscriptions(
    gym_id: str = Depends(get_gym_id), db: AsyncSession = Depends(get_db)
):
    logger.info("Fetching ended subscriptions for gym_id=%s", gym_id)
    cutoff = [date.today() + timedelta(days=i) for i in range(1, 4)]

    result = await db.execute(
        select(Subscriptions)
        .options(selectinload(Subscriptions.user))
        .where(Subscriptions.end_date.in_(cutoff), Subscriptions.gym_id == gym_id)
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

    logger.info("Ended subscriptions: %s", response)
    return response


@router.get(
    "/payments/history",
    status_code=status.HTTP_200_OK,
    response_model=list[PaymentResponse],
)
async def get_payment_history(
    gym_id: str = Depends(get_gym_id), db: AsyncSession = Depends(get_db)
):
    logger.info("Fetching payment history for gym_id=%s", gym_id)
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.user))
        .where(Payment.gym_id == gym_id)
        .order_by(Payment.payment_date.desc())
        .limit(5)
    )
    payments = result.scalars().all()
    logger.info("Payment history fetched successfully for gym_id=%s", gym_id)
    return payments


@router.get("/profit")
async def get_profit(
    gym_id: str = Depends(get_gym_id), db: AsyncSession = Depends(get_db)
):
    logger.info("Fetching profit stats for gym_id=%s", gym_id)
    today = date.today()

    daily_profit = await fetch_profit_from_db(today, today, db, gym_id)

    weekly_profit = await fetch_profit_from_db(
        today - relativedelta(days=6), today, db, gym_id
    )

    monthly_profit = await fetch_profit_from_db(today.replace(day=1), today, db, gym_id)

    response = {
        "daily_profit": daily_profit or 0,
        "weekly_profit": weekly_profit or 0,
        "monthly_profit": monthly_profit or 0,
    }
    logger.info("Profit stats: %s", response)
    return response


@router.get("/download/stats", status_code=status.HTTP_200_OK)
async def download_stats(
    gym_id: str = Depends(get_gym_id),
    db: AsyncSession = Depends(get_db),
):
    logger.info("Downloading dashboard stats for gym_id=%s", gym_id)
    wb = Workbook()
    ws = wb.active
    ws.title = "Dashboard Stats"

    font = Font(size=14)

    ws.append(
        [
            "Full Name",
            "Role",
            "Phone Number",
            "Subscription Start Date",
            "Subscription End Date",
        ]
    )
    ws.column_dimensions["A"].width = 25
    ws.column_dimensions["B"].width = 10
    ws.column_dimensions["C"].width = 25
    ws.column_dimensions["D"].width = 30
    ws.column_dimensions["E"].width = 30

    result = await db.execute(
        select(Subscriptions)
        .options(selectinload(Subscriptions.user))
        .where(Subscriptions.gym_id == gym_id)
    )
    subscriptions = result.scalars().all()

    for subscription in subscriptions:
        ws.append(
            [
                subscription.user.full_name,
                subscription.user.role,
                subscription.user.phone_number,
                subscription.start_date,
                subscription.end_date,
            ]
        )

    for row in ws.iter_rows():
        for cell in row:
            cell.font = font

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    logger.info("Dashboard stats file generated for gym_id=%s", gym_id)
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="dashboard_stats.xlsx"'},
    )
