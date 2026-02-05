from datetime import datetime, timezone
from typing import Optional, Dict, Any
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash

from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError


def ensure_user_indexes(users: Collection) -> None:
    """
    Create indexes (safe to call repeatedly).
    """
    users.create_index("email", unique=True)


def create_user(users: Collection, name: str, email: str, password: str) -> Dict[str, Any]:
    """
    Creates a user document. Raises DuplicateKeyError if email already exists.
    """
    now = datetime.now(timezone.utc)

    user_doc = {
        "name": name.strip(),
        "email": email.strip().lower(),
        "passwordHash": generate_password_hash(password),  # pbkdf2:sha256
        "createdAt": now,
        "updatedAt": now,
    }

    result = users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)

    # Never return password hash to client
    user_doc.pop("passwordHash", None)
    return user_doc


def find_user_by_email(users: Collection, email: str) -> Optional[Dict[str, Any]]:
    return users.find_one({"email": email.strip().lower()}, {"passwordHash": 0})

def get_all_users(users: Collection):
    """
    Returns all users without passwordHash.
    """
    cursor = users.find({}, {"passwordHash": 0})
    result = []

    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        result.append(doc)

    return result


def get_user_by_email(users: Collection, email: str):
    """
    Returns a single user by email.
    """
    user = users.find_one(
        {"email": email.strip().lower()},
        {"passwordHash": 0}
    )
    if user:
        user["_id"] = str(user["_id"])
    return user



def find_user_with_hash_by_email(users: Collection, email: str):
    """
    Returns user including passwordHash (for auth only).
    """
    return users.find_one({"email": email.strip().lower()})


def sanitize_user(user_doc):
    """
    Removes sensitive fields and converts _id to str.
    """
    if not user_doc:
        return None
    user_doc["_id"] = str(user_doc["_id"])
    user_doc.pop("passwordHash", None)
    return user_doc


def verify_user_password(users: Collection, email: str, password: str):
    """
    Verifies user credentials.
    Returns (user_sanitized, error_code, error_message)
    """
    user = find_user_with_hash_by_email(users, email)
    if not user:
        return None, 404, "User not found"

    stored_hash = user.get("passwordHash")
    if not stored_hash or not check_password_hash(stored_hash, password):
        return None, 401, "Invalid email or password"

    return sanitize_user(user), None, None
