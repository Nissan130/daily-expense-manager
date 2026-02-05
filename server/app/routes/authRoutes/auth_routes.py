from flask import Blueprint, current_app, request, jsonify
from pymongo.errors import DuplicateKeyError
from app.model.authModel.user_model import verify_user_password
from app.utils.jwt_utils import sign_token, verify_token
import jwt  # PyJWT exceptions



from app.db.mongo import get_db
from app.model.authModel.user_model import (
    ensure_user_indexes,
    create_user,
    get_all_users,
    get_user_by_email,
    verify_user_password,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# -------------------- SIGN UP --------------------
@auth_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not name:
        return jsonify({"success": False, "message": "Name is required"}), 400
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    if "@" not in email or "." not in email:
        return jsonify({"success": False, "message": "Invalid email"}), 400
    if not password or len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    db = get_db(current_app)
    users = db["users"]
    ensure_user_indexes(users)

    try:
        user = create_user(users, name=name, email=email, password=password)
        return jsonify({"success": True, "message": "User created", "user": user}), 201

    except DuplicateKeyError:
        return jsonify({"success": False, "message": "Email already exists"}), 409

    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


# -------------------- SIGN IN --------------------
@auth_bp.post("/signin")
def signin():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    db = get_db(current_app)
    users = db["users"]

    try:
        user, code, msg = verify_user_password(users, email=email, password=password)
        if code:
            return jsonify({"success": False, "message": msg}), code

        user_token = sign_token(
            payload={"email": user["email"], "uid": user["_id"]},
            secret=current_app.config["JWT_SECRET"],
            expires_seconds=current_app.config["JWT_EXPIRES_SECONDS"],
        )

        return jsonify({
            "success": True,
            "message": "Signed in",
            "user_token": user_token,
            "user": user
        }), 200

    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500



# -------------------- GET USERS --------------------
@auth_bp.get("/users")
def get_users():
    """
    GET /api/auth/users
    Optional query param: ?email=
    """
    db = get_db(current_app)
    users = db["users"]

    email = request.args.get("email")

    if email:
        user = get_user_by_email(users, email)
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        return jsonify({"success": True, "user": user}), 200

    # If no email param → return all users
    all_users = get_all_users(users)
    return jsonify({"success": True, "users": all_users}), 200


@auth_bp.get("/me")
def me():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"success": False, "message": "Missing token"}), 401

    user_token = auth.split(" ", 1)[1].strip()

    try:
        decoded = verify_token(user_token, current_app.config["JWT_SECRET"])
        email = decoded.get("email")
        if not email:
            return jsonify({"success": False, "message": "Invalid token"}), 401

        db = get_db(current_app)
        users = db["users"]

        user = get_user_by_email(users, email)
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        return jsonify({"success": True, "user": user}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401
