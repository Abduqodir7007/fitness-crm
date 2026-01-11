from uuid import UUID
from pydantic import (
    BaseModel,
    field_serializer,
)
from .users import UserCreate


class AdminResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    phone_number: str

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)

    class Config:
        from_attributes = True


class GymAndAdminCreate(BaseModel):
    name: str
    address: str | None = None
    user: UserCreate

    class Config:
        from_attributes = True


class GymResponse(BaseModel):
    id: UUID
    name: str
    address: str | None = None
    is_active: bool
    admin: AdminResponse | None = None

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)

    class Config:
        from_attributes = True
