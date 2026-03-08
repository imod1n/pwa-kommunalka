from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "kommunalka")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        # Проверка соединения
        await client.admin.command("ping")
        logger.info(f"✅ Подключились к MongoDB: {DB_NAME}")
        # Создаём индексы
        await db.payments.create_index("date")
        await db.payments.create_index("category")
    except Exception as e:
        logger.error(f"❌ Ошибка подключения к MongoDB: {e}")
        raise


async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB соединение закрыто")


def get_collection(name: str = "payments"):
    return db[name]
