from flask import Blueprint, current_app, jsonify
from app.db.mongo import get_db

health_bp = Blueprint("health", __name__, url_prefix="/api")

@health_bp.get("/health")
def health():
    """
    Checks server + DB connectivity.
    """
    db = get_db(current_app)
    # ping the server
    current_app.extensions["mongo_client"].admin.command("ping")
    return jsonify({
        "status": "ok",
        "db": db.name
    })
