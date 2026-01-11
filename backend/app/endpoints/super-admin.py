from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..dependancy import get_superuser
from ..database import get_db
from ..models import Users, Gyms
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from ..schemas.users import (
    GymAndAdminCreate,
    GymResponse,
)

router = APIRouter(prefix="/superadmin", tags=["SuperAdmin"])


@router.post("/create-gym", status_code=status.HTTP_201_CREATED)
async def create_gym_and_admin(
    gym_admin: GymAndAdminCreate, db: AsyncSession = Depends(get_db)
):
    new_gym = Gyms(name=gym_admin.name, address=gym_admin.address)
    db.add(new_gym)

    admin = await db.execute(
        select(Users).where(Users.phone_number == gym_admin.phone_number)
    )

    if admin.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user with this phone number already exists",
        )

    hashed_password = hash_password(gym_admin.user.password)

    new_admin = Users(
        first_name=gym_admin.user.first_name,
        last_name=gym_admin.user.last_name,
        phone_number=gym_admin.user.phone_number,
        hashed_password=hashed_password,
        gym_id=new_gym.id,
        role="admin",
    )
    db.add(new_admin)
    await db.commit()

    return {"message": "Gym and admin user created successfully"}


@router.get("/gyms", response_model=list[GymResponse])
async def get_gyms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Gyms, Users).join(
            Users, (Gyms.id == Users.gym_id) & (Users.role == "admin")
        )
    )
    gyms = result.scalars().all()

    return gyms
