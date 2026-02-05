# app/routes/settingsRoutes/settings_routes.py
from flask import Blueprint, request, jsonify, current_app

from app.db.mongo import get_db
from app.utils.auth import require_auth, get_authed_email
from app.model.settingsModel.settings_model import (
    ensure_settings_indexes,
    list_categories,
    add_category,
    delete_category,
)

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


@settings_bp.get("/health")
def health():
    return jsonify({"ok": True, "service": "settings"}), 200


@settings_bp.get("/categories")
@require_auth
def get_categories():
    userEmail = get_authed_email()

    db = get_db(current_app)
    col = db["settings"]
    ensure_settings_indexes(col)

    try:
        cats = list_categories(col, userEmail)
        return jsonify({"success": True, "categories": cats}), 200
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


@settings_bp.post("/categories")
@require_auth
def create_category():
    userEmail = get_authed_email()
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    color = data.get("color")  # optional

    db = get_db(current_app)
    col = db["settings"]
    ensure_settings_indexes(col)

    try:
        cats = add_category(col, userEmail, name=name, color=color)
        return jsonify({"success": True, "message": "Category added", "categories": cats}), 201
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


@settings_bp.delete("/categories/<name>")
@require_auth
def remove_category(name):
    userEmail = get_authed_email()

    db = get_db(current_app)
    col = db["settings"]
    ensure_settings_indexes(col)

    try:
        cats = delete_category(col, userEmail, name=name)
        return jsonify({"success": True, "message": "Category deleted", "categories": cats}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500
