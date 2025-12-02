from fastapi import APIRouter, Depends, HTTPException, status
from dependancy import get_superuser

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=Depends(get_superuser))


