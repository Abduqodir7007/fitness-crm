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
    UserResponse,
)
from ..schemas.gyms import (
    GymAndAdminCreate,
    GymResponse,
)

router = APIRouter(prefix="/superadmin", tags=["SuperAdmin"])


@router.post("/create-gym", status_code=status.HTTP_201_CREATED)
async def create_gym_and_admin(
    gym_admin: GymAndAdminCreate, db: AsyncSession = Depends(get_db)
):

    admin = await db.execute(
        select(Users).where(Users.phone_number == gym_admin.user.phone_number)
    )

    if admin.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu telefon raqami bilan foydalanuvchi mavjud",
        )

    new_gym = Gyms(name=gym_admin.name, address=gym_admin.address)
    db.add(new_gym)
    await db.flush()

    hashed_password = await hash_password(gym_admin.user.password)

    new_admin = Users(
        first_name=gym_admin.user.first_name,
        last_name=gym_admin.user.last_name,
        phone_number=gym_admin.user.phone_number,
        hashed_password=hashed_password,
        date_of_birth=gym_admin.user.date_of_birth,
        gender=gym_admin.user.gender,
        gym_id=new_gym.id,
        role="admin",
    )
    db.add(new_admin)
    await db.commit()

    return {"message": "Zal va admin muvaffaqiyatli yaratildi"}


@router.get("/gyms", response_model=list[GymResponse])
async def get_gyms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Gyms, Users)
        .outerjoin(Users, (Gyms.id == Users.gym_id) & (Users.role == "admin"))
        .where(Gyms.is_active == True)
    )
    rows = result.all()

    response = []
    for gym, admin in rows:
        gym.admin = admin if admin else None
        response.append(gym)

    return response


@router.delete("/gyms/{gym_id}", status_code=status.HTTP_200_OK)
async def delete_gym(gym_id: str, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Gyms).where(Gyms.id == gym_id))
    gym = result.scalars().first()

    if not gym:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Zal topilmadi"
        )

    admin_result = await db.execute(
        select(Users).where((Users.gym_id == gym.id) & (Users.role == "admin"))
    )
    admin = admin_result.scalars().first()

    if admin:
        await db.delete(admin)

    await db.delete(gym)
    await db.commit()

    return {"message": "Zal muvaffaqiyatli o'chirildi"}
