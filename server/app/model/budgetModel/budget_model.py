# app/model/budgetModel/budget_model.py
from datetime import datetime
from pymongo import ASCENDING, DESCENDING


def ensure_budget_indexes(budgets_col):
    budgets_col.create_index([("userEmail", ASCENDING), ("month", ASCENDING)])
    budgets_col.create_index([("userEmail", ASCENDING), ("createdAt", DESCENDING)])
    budgets_col.create_index([("userEmail", ASCENDING), ("month", ASCENDING), ("createdAt", DESCENDING)])


def _validate_month(month: str) -> str:
    month = (month or "").strip()
    if len(month) != 7 or month[4] != "-":
        raise ValueError("Month must be in YYYY-MM format")
    y, m = month.split("-", 1)
    if not (y.isdigit() and m.isdigit()):
        raise ValueError("Month must be in YYYY-MM format")
    yi = int(y)
    mi = int(m)
    if yi < 2000 or yi > 2100:
        raise ValueError("Invalid year")
    if mi < 1 or mi > 12:
        raise ValueError("Invalid month")
    return month


def serialize_budget(doc):
    if not doc:
        return None

    def _dt(v):
        return v.isoformat() if hasattr(v, "isoformat") else v

    return {
        "_id": str(doc.get("_id")),
        "userEmail": doc.get("userEmail"),
        "month": doc.get("month"),  # YYYY-MM
        "amount": float(doc.get("amount", 0)),
        "notes": doc.get("notes", ""),
        "createdAt": _dt(doc.get("createdAt")),
        "updatedAt": _dt(doc.get("updatedAt")),
    }


def create_budget(budgets_col, *, userEmail, month, amount, notes=""):
    userEmail = (userEmail or "").strip().lower()
    notes = (notes or "").strip()
    month = _validate_month(month)

    if not userEmail or "@" not in userEmail:
        raise ValueError("User email is required")

    try:
        amount = float(amount)
    except Exception:
        raise ValueError("Amount must be a number")

    if amount <= 0:
        raise ValueError("Amount must be > 0")

    now = datetime.utcnow()  # ✅ store datetime object

    payload = {
        "userEmail": userEmail,
        "month": month,
        "amount": amount,
        "notes": notes,
        "createdAt": now,
        "updatedAt": now,
    }

    res = budgets_col.insert_one(payload)
    payload["_id"] = res.inserted_id
    return serialize_budget(payload)


def list_budgets(budgets_col, *, userEmail, limit=200, skip=0, month=None):
    userEmail = (userEmail or "").strip().lower()
    if not userEmail:
        raise ValueError("User email is required")

    q = {"userEmail": userEmail}
    if month:
        q["month"] = _validate_month(month)

    cur = (
        budgets_col.find(q)
        .sort("createdAt", DESCENDING)
        .skip(int(skip))
        .limit(int(limit))
    )
    return [serialize_budget(d) for d in cur]
