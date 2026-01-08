import json
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


from ..schemas.users import UserListResponse, UpdateUserPassword, UpdateUserInformation
from ..schemas.admin import AttendanceResponse
from ..models import Users, Subscriptions, Attendance
from ..websocket import manager
from ..database import get_db
from ..utils import is_subscription_active
from ..dependancy import get_current_user, get_superuser
from ..security import hash_password

from sqlalchemy import and_
from sqlalchemy.orm import selectinload
from fastapi import (
    APIRouter,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
    Query,
    Depends,
)

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", status_code=status.HTTP_200_OK, response_model=list[UserListResponse])
async def get_all_users(
    q: str = Query(None),
    active_sub: bool = Query(None),
    db: AsyncSession = Depends(get_db),
):

    query = select(Users).where(
        and_(Users.is_superuser == False, Users.role == "client")
    )

    if active_sub:
        query = query.join(Users.subscriptions).where(
            Subscriptions.is_active == active_sub
        )

    if q:
        query = query.where(
            (Users.first_name.ilike(f"%{q}%"))
            | (Users.last_name.ilike(f"%{q}%"))
            | (Users.phone_number.ilike(f"%{q}%"))
        )

    users = (await db.execute(query)).scalars().all()

    return users


@router.get("/me", status_code=status.HTTP_200_OK)
async def get_current_user_info(
    user: Users = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Users)
        .options(
            selectinload(Users.subscriptions).selectinload(Subscriptions.plan),
            selectinload(Users.payments),
        )
        .where(Users.id == user.id)
    )
    user_data = result.scalars().first()

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    response = {
        "id": str(user_data.id),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone_number": user_data.phone_number,
        "date_of_birth": user_data.date_of_birth,
        "gender": user_data.gender,
        "role": user_data.role,
        "is_active": user_data.is_active,
        "payments": (
            [
                {
                    "amount": pay.amount,
                    "payment_date": pay.payment_date,
                    "payment_method": pay.payment_method,
                }
                for pay in user_data.payments
            ]
            if user_data.payments
            else []
        ),
        "subscriptions": (
            [
                {
                    "start_date": sub.start_date,
                    "end_date": sub.end_date,
                    "days_left": (
                        (sub.end_date - date.today()).days if sub.end_date else 0
                    ),
                    "plan": (
                        {
                            "type": sub.plan.type if sub.plan else None,
                            "price": sub.plan.price if sub.plan else 0,
                            "duration_days": sub.plan.duration_days if sub.plan else 0,
                            "is_active": sub.plan.is_active if sub.plan else False,
                        }
                        if sub.plan
                        else None
                    ),
                }
                for sub in user_data.subscriptions
            ]
            if user_data.subscriptions
            else []
        ),
    }

    return response


@router.get(
    "/trainers", status_code=status.HTTP_200_OK, response_model=list[UserListResponse]
)
async def get_trainers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Users).where(and_(Users.role == "trainer", Users.is_active == True))
    )
    trainers = result.scalars().all()
    return trainers


@router.get("/trainer/{trainer_id}", status_code=status.HTTP_200_OK)
async def get_trainer_by_id(trainer_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Users).where(Users.id == trainer_id))
    trainer = result.scalars().first()

    if not trainer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainer not found",
        )

    response = {
        "id": trainer.id,
        "first_name": trainer.first_name,
        "last_name": trainer.last_name,
        "phone_number": trainer.phone_number,
        "date_of_birth": trainer.date_of_birth,
        "gender": trainer.gender,
    }

    return response


@router.get("/{user_id}", status_code=status.HTTP_200_OK)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Users)
        .options(
            selectinload(Users.subscriptions).selectinload(Subscriptions.plan),
            selectinload(Users.payments),
        )
        .where(Users.id == user_id)
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    response = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone_number": user.phone_number,
        "date_of_birth": user.date_of_birth,
        "gender": user.gender,
        "is_active": user.is_active,
        "payments": [
            {
                "amount": pay.amount,
                "payment_date": pay.payment_date,
                "payment_method": pay.payment_method,
            }
            for pay in user.payments
        ],
        "subscriptions": [
            {
                "start_date": sub.start_date,
                "end_date": sub.end_date,
                "days_left": (sub.end_date - date.today()).days,
                "plan": {
                    "type": sub.plan.type,
                    "price": sub.plan.price,
                    "duration_days": sub.plan.duration_days,
                    "is_active": sub.plan.is_active,
                },
            }
            for sub in user.subscriptions
        ],
    }

    return response


@router.patch("/update/password", status_code=status.HTTP_200_OK)
async def update_user_password(
    password: UpdateUserPassword,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Users).where(Users.id == password.user_id))
    user = result.scalars().first()

    user.hashed_password = await hash_password(password.password)

    await db.commit()
    return {"detail": "Password updated successfully"}


@router.patch("/update/info")
async def update_user_information(
    user_info: UpdateUserInformation,
    db: AsyncSession = Depends(get_db),
    user: Users = Depends(get_superuser),
):
    result = await db.execute(select(Users).where(Users.id == user_info.user_id))
    user = result.scalars().first()

    if user_info.first_name is not None:
        user.first_name = user_info.first_name

    if user_info.last_name is not None:
        user.last_name = user_info.last_name

    if user_info.phone_number is not None:
        user.phone_number = user_info.phone_number

    await db.commit()
    return {"detail": "User information updated successfully"}


@router.delete("/delete/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):

    is_active = await is_subscription_active(user_id, db)
    if is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user with active subscription",
        )

    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}


@router.get("/trainers/{trainer_id}/clients/", status_code=status.HTTP_200_OK)
async def get_trainer_clients(trainer_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subscriptions)
        .options(selectinload(Subscriptions.user), selectinload(Subscriptions.plan))
        .where(Subscriptions.trainer_id == trainer_id)
    )
    subscriptions = result.scalars().all()

    response = []
    for sub in subscriptions:
        response.append(
            {
                "client_name": sub.user.full_name,
                "phone_number": sub.user.phone_number,
                "subscription_type": sub.plan.type,
                "start_date": sub.start_date,
                "end_date": sub.end_date,
            }
        )

    return {"total_clients": len(subscriptions), "clients": response}


@router.post("/attendance")
async def create_attendance(
    current_user: Users = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Attendance).where(
            and_(Attendance.user_id == current_user.id, Attendance.date == date.today())
        )
    )
    attendance = result.scalars().first()

    if attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already in an attendance",
        )

    new_attendance = Attendance(user_id=current_user.id)
    db.add(new_attendance)
    await db.commit()

    return {"message": "Attendance marked successfully"}


@router.get(
    "/attendance/list/",
    status_code=status.HTTP_200_OK,
    response_model=list[AttendanceResponse],
)
async def get_attendance(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Attendance)
        .options(selectinload(Attendance.user))
        .where(Attendance.date == date.today())
    )
    attendances = result.scalars().all()

    return attendances


@router.websocket("/ws/trainers")
async def websocket_trainers_endpoint(
    websocket: WebSocket, db: AsyncSession = Depends(get_db)
):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "trainers":
                query = select(Users).where(
                    and_(Users.role == "trainer", Users.is_active == True)
                )
                result = await db.execute(query)
                trainers = result.scalars().all()

                trainers_data = [
                    UserListResponse.model_validate(trainer).model_dump()
                    for trainer in trainers
                ]

                await websocket.send_json({"type": "trainers", "data": trainers_data})
    except WebSocketDisconnect:
        await manager.disconnect(websocket)


@router.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "users":
                query = select(Users).where(
                    and_(Users.is_superuser == False, Users.role == "client")
                )
                result = await db.execute(query)
                users = result.scalars().all()

                users_data = [
                    UserListResponse.model_validate(user).model_dump() for user in users
                ]

                await manager.broadcast({"type": "users", "data": users_data})
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
