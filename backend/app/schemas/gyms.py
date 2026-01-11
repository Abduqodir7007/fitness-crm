from uuid import UUID
from schemas.users import UserCreate, UserResponse

from pydantic import (
    BaseModel,
    field_serializer,
    field_validator,
    model_validator,
)


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
    admin: UserResponse | None = None

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)