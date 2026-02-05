from flask import Flask
from dotenv import load_dotenv
from pathlib import Path

# Load .env FIRST (before importing Config)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.config import Config
from app.extensions import cors
from app.db.mongo import init_mongo
from app.routes import register_routes

def create_app():
    load_dotenv()  # loads .env

    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS (allow React dev server)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS") or "*"}})

    # Mongo init
    init_mongo(app)

    # Routes
    register_routes(app)

    return app
