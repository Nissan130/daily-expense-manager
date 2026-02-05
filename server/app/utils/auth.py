# app/utils/auth.py
import os
import jwt
from functools import wraps
from flask import request, jsonify

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_change_me")
JWT_ALGO = "HS256"


def extract_bearer_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return auth.split(" ", 1)[1].strip()


def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = extract_bearer_token()
        if not token:
            return jsonify({"success": False, "message": "Missing Bearer token"}), 401
        try:
            payload = decode_token(token)
        except Exception:
            return jsonify({"success": False, "message": "Invalid or expired token"}), 401

        # attach to request context
        request.user = payload
        return fn(*args, **kwargs)
    return wrapper


def get_authed_email():
    # request.user is set by require_auth
    u = getattr(request, "user", {}) or {}
    return (u.get("email") or "").strip().lower()
