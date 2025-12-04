import json
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
    Query,
)
from ..dependancy import get_superuser
from ..database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.users import UserResponse
from ..models import Users, Subscriptions
from sqlalchemy.future import select
from ..websocket import manager
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_users(
    q: str = Query(None),
    active_sub: bool = Query(None),
    db: AsyncSession = Depends(get_db),
):

    query = select(Users)

    if active_sub:  # active_sub should be boolean value
        query = query.join(Users.subscriptions).where(
            Subscriptions.is_active == active_sub
        )

    if q:
        query = query.where(
            (Users.first_name.ilike(f"%{q}%")) | (Users.last_name.ilike(f"%{q}%"))
        )

    users = (await db.execute(query)).scalars().all()
    response = [{**UserResponse.model_validate(user).model_dump()} for user in users]
    return response


@router.delete("/delete/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):

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
                    UserResponse.model_validate(trainer).model_dump()
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
                query = select(Users)
                result = await db.execute(query)
                users = result.scalars().all()

                users_data = [
                    UserResponse.model_validate(user).model_dump() for user in users
                ]

                await manager.broadcast({"type": "users", "data": users_data})
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
