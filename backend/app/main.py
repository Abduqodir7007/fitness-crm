from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.endpoints import admin, auth, user

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins. In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(admin.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
