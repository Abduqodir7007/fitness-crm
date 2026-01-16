from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..utils import is_superuser_exists
from ..database import get_db
from ..models import Users, Gyms
from ..security import (
    hash_password,
)
from ..schemas.users import (
    CreateSuperUser,
)
from ..schemas.gyms import (
    GymAndAdminCreate,
    GymResponse,
)

router = APIRouter(prefix="/superadmin", tags=["SuperAdmin"])


@router.post("/create-super-admin", status_code=status.HTTP_201_CREATED)
async def create_super_admin(
    super_user: CreateSuperUser, db: AsyncSession = Depends(get_db)
):

    if await is_superuser_exists(db):
        raise HTTPException(
            detail="Superuser already exists", status_code=status.HTTP_400_BAD_REQUEST
        )
    user_data = super_user.model_dump(exclude={"password"})

    hashed_password = await hash_password(super_user.password)

    user_data.update({"is_superuser": True, "hashed_password": hashed_password})

    super_user = Users(**user_data)

    db.add(super_user)
    await db.commit()

    return {"message": "Super admin created successfully"}


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

    user_data = gym_admin.user.model_dump(exclude={"password"})

    hashed_password = await hash_password(gym_admin.user.password)

    user_data.update(
        {"gym_id": new_gym.id, "role": "admin", "hashed_password": hashed_password}
    )

    new_admin = Users(**user_data)

    db.add(new_admin)
    await db.commit()

    return {"message": "Zal va admin muvaffaqiyatli yaratildi"}


@router.get("/gyms", response_model=list[GymResponse])
async def get_gyms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Gyms, Users).outerjoin(
            Users, (Gyms.id == Users.gym_id) & (Users.role == "admin")
        )
    )
    rows = result.all()

    response = []
    for gym, admin in rows:
        gym.admin = admin if admin else None
        response.append(gym)

    return response


@router.patch("/gym/{id}", status_code=status.HTTP_200_OK)
async def update_gym(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Gyms).where(Gyms.id == id))
    gym = result.scalars().first()

    if not gym:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Zal topilmadi"
        )

    if gym.is_active:
        gym.is_active = False
        await db.commit()
        return {"message": "Zal muvaffaqiyatli yangilandi"}

    gym.is_active = True

    await db.commit()
    return {"message": "Zal muvaffaqiyatli yangilandi"}


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


@router.get("/admin-users")
async def get_admin_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(Users.id)).where(
            Users.role == "admin", Users.is_active == True
        )
    )
    number_of_admins = result.scalars().first()
    return {"number_of_admins": number_of_admins}
