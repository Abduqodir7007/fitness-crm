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


@router.get("/", status_code=status.HTTP_200_OK, response_model=list[UserResponse])
async def get_all_users(
    q: str = Query(None),
    active_sub: bool = Query(None),
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(select(Users))

    if active_sub:  # active_sub should be boolean value
        result = await db.execute(
            select(Users)
            .join(Users.subscriptions)
            .where(Subscriptions.is_active == active_sub)
        )

    if q:
        result = await db.execute(
            select(Users).where(
                (Users.first_name.ilike(f"%{q}%")) | (Users.last_name.ilike(f"%{q}%"))
            )
        )

    users = result.scalars().all()
    return users


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


@router.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "users":
                users = await get_all_users(db)
                await manager.broadcast({"type": "users", "data": users})
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
