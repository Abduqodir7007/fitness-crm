from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    DATABASE_URL: str
    JWT_ALGORITHM: str
    JWT_SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str

    MONTHLY_PROFIT: str
    WEEKLY_CLIENTS: str


    class Config:
        env_file = "../.env"


settings = Settings()
