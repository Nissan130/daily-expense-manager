import os

class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_EXPIRES_SECONDS = int(os.getenv("JWT_EXPIRES_SECONDS", "2592000"))  # 7 days

    # Comma-separated origins
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
