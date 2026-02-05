# app/model/settingsModel/settings_model.py
from datetime import datetime
import re

DEFAULT_CATEGORIES = [
    {"name": "Food", "color": "#10B981"},
    {"name": "Transport", "color": "#3B82F6"},
    {"name": "Bills", "color": "#8B5CF6"},
    {"name": "Shopping", "color": "#F59E0B"},
    {"name": "Health", "color": "#EF4444"},
    {"name": "Other", "color": "#6B7280"},
]

# nice palette for auto-picking unused colors
PALETTE = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280",
    "#14B8A6", "#6366F1", "#A855F7", "#F97316", "#E11D48", "#64748B",
    "#22C55E", "#0EA5E9", "#D946EF", "#F43F5E", "#84CC16", "#A3A3A3",
]

HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


def ensure_settings_indexes(settings_col):
    settings_col.create_index([("userEmail", 1)], unique=True, name="uniq_user_settings")


def _normalize_name(name: str) -> str:
    s = (name or "").strip()
    if not s:
        raise ValueError("Category name is required")
    if len(s) > 32:
        raise ValueError("Category name must be <= 32 characters")
    s = " ".join(s.split())
    return s


def _normalize_color(color: str | None) -> str | None:
    if color is None:
        return None
    c = (color or "").strip()
    if not c:
        return None
    if not HEX_RE.match(c):
        raise ValueError("Color must be a hex like #RRGGBB")
    return c.upper()


def _color_set(categories: list[dict]) -> set[str]:
    used = set()
    for c in categories or []:
        col = (c.get("color") or "").strip().upper()
        if col:
            used.add(col)
    return used


def _pick_unused_color(used: set[str]) -> str:
    for c in PALETTE:
        cu = c.upper()
        if cu not in used:
            return cu
    # fallback if palette exhausted
    return "#6B7280"


def get_or_create_settings(settings_col, userEmail: str) -> dict:
    doc = settings_col.find_one({"userEmail": userEmail})
    if doc:
        if not isinstance(doc.get("categories"), list) or len(doc["categories"]) == 0:
            settings_col.update_one(
                {"_id": doc["_id"]},
                {"$set": {"categories": DEFAULT_CATEGORIES, "updatedAt": datetime.utcnow()}},
            )
            doc["categories"] = DEFAULT_CATEGORIES
        return doc

    doc = {
        "userEmail": userEmail,
        "categories": DEFAULT_CATEGORIES,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    settings_col.insert_one(doc)
    return doc


def list_categories(settings_col, userEmail: str) -> list:
    doc = get_or_create_settings(settings_col, userEmail)
    cats = doc.get("categories") or []
    # sort for UX
    return sorted(cats, key=lambda c: (c.get("name") or "").lower())


def add_category(settings_col, userEmail: str, name: str, color: str | None = None) -> list:
    name = _normalize_name(name)

    doc = get_or_create_settings(settings_col, userEmail)
    categories = doc.get("categories") or []

    # name unique (case-insensitive)
    exists = any((c.get("name") or "").strip().lower() == name.lower() for c in categories)
    if exists:
        raise ValueError("Category already exists")

    used_colors = _color_set(categories)

    normalized_color = _normalize_color(color)
    if normalized_color:
        if normalized_color in used_colors:
            raise ValueError("Color already used by another category")
        final_color = normalized_color
    else:
        final_color = _pick_unused_color(used_colors)

    new_cat = {
        "name": name,
        "color": final_color,
        "createdAt": datetime.utcnow(),
    }

    settings_col.update_one(
        {"userEmail": userEmail},
        {"$push": {"categories": new_cat}, "$set": {"updatedAt": datetime.utcnow()}},
        upsert=True,
    )

    return list_categories(settings_col, userEmail)


def delete_category(settings_col, userEmail: str, name: str) -> list:
    name = _normalize_name(name)

    # protect "Other" (optional but recommended)
    if name.strip().lower() == "other":
        raise ValueError("Cannot delete 'Other' category")

    doc = get_or_create_settings(settings_col, userEmail)
    categories = doc.get("categories") or []

    # find actual stored name to delete (case-insensitive)
    target = None
    for c in categories:
        if (c.get("name") or "").strip().lower() == name.lower():
            target = c.get("name")
            break

    if not target:
        raise ValueError("Category not found")

    settings_col.update_one(
        {"userEmail": userEmail},
        {"$pull": {"categories": {"name": target}}, "$set": {"updatedAt": datetime.utcnow()}},
    )

    return list_categories(settings_col, userEmail)
