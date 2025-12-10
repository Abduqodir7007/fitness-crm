from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    
    DATABASE_URL: str

    JWT_ALGORITHM: str
    JWT_SECRET_KEY: str
    
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    CACHE_KEY: str

    class Config:
        env_file = "../.env"


settings = Settings()

