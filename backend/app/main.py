from fastapi import FastAPI
from app.endpoints import admin
from app.endpoints import auth

app = FastAPI()


app.include_router(admin.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

