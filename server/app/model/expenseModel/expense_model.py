# app/model/expenseModel/expense_model.py
from datetime import datetime
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING, ReturnDocument
from pymongo.errors import OperationFailure


def ensure_expense_indexes(expenses_col):
    """
    Create indexes safely.
    If an index exists with the same NAME but different KEYS/OPTIONS, drop it and recreate.
    Also avoids crashing your API with OperationFailure.
    """
    desired = [
        ("idx_userEmail_date_desc", [("userEmail", ASCENDING), ("date", DESCENDING)]),
        ("idx_userEmail_createdAt_desc", [("userEmail", ASCENDING), ("createdAt", DESCENDING)]),
    ]

    existing = {}
    try:
        for idx in expenses_col.list_indexes():
            existing[idx.get("name")] = idx
    except Exception:
        existing = {}

    for name, keys in desired:
        try:
            if name in existing:
                ex = existing[name]
                ex_key = dict(ex.get("key", {}))
                want_key = dict(keys)

                if ex_key != want_key:
                    expenses_col.drop_index(name)

            expenses_col.create_index(keys, name=name)

        except OperationFailure as e:
            if getattr(e, "code", None) in (85, 86):
                try:
                    expenses_col.drop_index(name)
                    expenses_col.create_index(keys, name=name)
                except Exception:
                    pass
            else:
                raise


def _to_iso_date(date_str: str) -> str:
    date_str = (date_str or "").strip()
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.strftime("%Y-%m-%d")


def serialize_expense(doc):
    if not doc:
        return None
    return {
        "_id": str(doc.get("_id")),
        "userEmail": doc.get("userEmail"),
        "title": doc.get("title"),
        "amount": float(doc.get("amount", 0)),
        "category": doc.get("category"),
        "date": doc.get("date"),
        "notes": doc.get("notes", ""),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def _normalize_category(cat: str) -> str:
    cat = " ".join((cat or "").strip().split())
    if not cat:
        return "Other"
    if len(cat) > 32:
        raise ValueError("Category must be <= 32 characters")
    return cat


def _category_allowed(category: str, allowed_categories: set[str] | None) -> bool:
    """
    allowed_categories should come from settings.categories (names).
    Always allow 'Other'.
    """
    if allowed_categories is None:
        # if caller didn't pass allowed list, we don't block
        return True
    allowed = set(allowed_categories)
    allowed.add("Other")
    return category in allowed


def create_expense(expenses_col, *, userEmail, title, amount, category, date, notes="", allowed_categories=None):
    title = (title or "").strip()
    notes = (notes or "").strip()
    userEmail = (userEmail or "").strip().lower()

    if not userEmail or "@" not in userEmail:
        raise ValueError("User email is required")
    if not title:
        raise ValueError("Title is required")

    try:
        amount = float(amount)
    except Exception:
        raise ValueError("Amount must be a number")

    if amount <= 0:
        raise ValueError("Amount must be > 0")

    if not date:
        raise ValueError("Date is required")
    date_iso = _to_iso_date(date)

    category = _normalize_category(category)

    # ✅ validate using settings categories (not hardcoded)
    if not _category_allowed(category, allowed_categories):
        raise ValueError("Invalid category")

    now = datetime.utcnow().isoformat()
    payload = {
        "userEmail": userEmail,
        "title": title,
        "amount": amount,
        "category": category,
        "date": date_iso,
        "notes": notes,
        "createdAt": now,
        "updatedAt": now,
    }

    res = expenses_col.insert_one(payload)
    payload["_id"] = res.inserted_id
    return serialize_expense(payload)


def get_expenses(expenses_col, *, userEmail, date_from=None, date_to=None, limit=200, skip=0):
    userEmail = (userEmail or "").strip().lower()
    if not userEmail:
        raise ValueError("User email is required")

    q = {"userEmail": userEmail}

    if date_from or date_to:
        q["date"] = {}
        if date_from:
            q["date"]["$gte"] = _to_iso_date(date_from)
        if date_to:
            q["date"]["$lte"] = _to_iso_date(date_to)

    cur = expenses_col.find(q).sort("date", DESCENDING).skip(int(skip)).limit(int(limit))
    return [serialize_expense(d) for d in cur]


def update_expense(expenses_col, *, expense_id, userEmail, patch: dict, allowed_categories=None):
    userEmail = (userEmail or "").strip().lower()
    if not userEmail:
        raise ValueError("User email is required")

    oid = ObjectId(expense_id)

    allowed_fields = {"title", "amount", "category", "date", "notes"}
    update = {}

    for k, v in (patch or {}).items():
        if k not in allowed_fields:
            continue

        if k == "title":
            v = (v or "").strip()
            if not v:
                raise ValueError("Title is required")
            update["title"] = v

        elif k == "amount":
            try:
                v = float(v)
            except Exception:
                raise ValueError("Amount must be a number")
            if v <= 0:
                raise ValueError("Amount must be > 0")
            update["amount"] = v

        elif k == "category":
            cat = _normalize_category(v)

            # ✅ validate using settings categories (not hardcoded)
            if not _category_allowed(cat, allowed_categories):
                raise ValueError("Invalid category")

            update["category"] = cat

        elif k == "date":
            if not v:
                raise ValueError("Date is required")
            update["date"] = _to_iso_date(v)

        elif k == "notes":
            update["notes"] = (v or "").strip()

    if not update:
        raise ValueError("No valid fields to update")

    update["updatedAt"] = datetime.utcnow().isoformat()

    res = expenses_col.find_one_and_update(
        {"_id": oid, "userEmail": userEmail},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )

    return serialize_expense(res)


def delete_expense(expenses_col, *, expense_id, userEmail):
    userEmail = (userEmail or "").strip().lower()
    if not userEmail:
        raise ValueError("User email is required")

    oid = ObjectId(expense_id)
    res = expenses_col.delete_one({"_id": oid, "userEmail": userEmail})
    return res.deleted_count == 1
