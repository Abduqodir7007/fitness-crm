import json
from ..database import get_db
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.users import UserListResponse, UserResponse
from ..models import Users, Subscriptions
from sqlalchemy.future import select
from ..websocket import manager
from ..utils import is_subscription_active
from sqlalchemy import or_, and_
from sqlalchemy.orm import selectinload
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
    Query,
)

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/", status_code=status.HTTP_200_OK, response_model=list[UserListResponse])
async def get_all_users(
    q: str = Query(None),
    active_sub: bool = Query(None),
    db: AsyncSession = Depends(get_db),
):

    query = select(Users)

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


@router.get("/{user_id}", status_code=status.HTTP_200_OK)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Users)
        .options(selectinload(Users.subscriptions).selectinload(Subscriptions.plan))
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
                query = select(Users).where(Users.role == "trainer")
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
                    and_(Users.role != "admin", Users.role != "trainer")
                )
                result = await db.execute(query)
                users = result.scalars().all()

                users_data = [
                    UserListResponse.model_validate(user).model_dump() for user in users
                ]

                await manager.broadcast({"type": "users", "data": users_data})
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
