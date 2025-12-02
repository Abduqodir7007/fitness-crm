from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from config import settings
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(engine=DATABASE_URL, echo=True)

async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    async with async_session() as session:
        yield session
