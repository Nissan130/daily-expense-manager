# app/routes/expenseRoutes.py
from datetime import datetime
import calendar

from flask import Blueprint, current_app, request, jsonify
from bson.errors import InvalidId

from app.db.mongo import get_db
from app.utils.auth import require_auth, get_authed_email
from app.model.expenseModel.expense_model import (
    ensure_expense_indexes,
    create_expense,
    get_expenses,
    update_expense,
    delete_expense,
)
from app.model.settingsModel.settings_model import (
    ensure_settings_indexes,
    list_categories,
)

expense_bp = Blueprint("expenses", __name__, url_prefix="/api/expenses")


@expense_bp.get("/health")
def health():
    return jsonify({"ok": True, "service": "expenses"}), 200


def _valid_year(year: str) -> str:
    y = (year or "").strip()
    if len(y) != 4 or not y.isdigit():
        raise ValueError("year must be YYYY")
    yi = int(y)
    if yi < 2000 or yi > 2100:
        raise ValueError("Invalid year")
    return y


def _valid_month(month: str) -> str:
    m = (month or "").strip()
    if len(m) != 7 or m[4] != "-":
        raise ValueError("month must be YYYY-MM")
    y, mm = m.split("-", 1)
    if not (y.isdigit() and mm.isdigit()):
        raise ValueError("month must be YYYY-MM")
    yi = int(y)
    mi = int(mm)
    if yi < 2000 or yi > 2100:
        raise ValueError("Invalid year")
    if mi < 1 or mi > 12:
        raise ValueError("Invalid month")
    return m


def _valid_date(date_str: str) -> str:
    d = (date_str or "").strip()
    datetime.strptime(d, "%Y-%m-%d")
    return d


def _month_to_from_to(month: str) -> tuple[str, str]:
    month = _valid_month(month)
    y, m = month.split("-", 1)
    yi = int(y)
    mi = int(m)
    last_day = calendar.monthrange(yi, mi)[1]
    return (f"{month}-01", f"{month}-{last_day:02d}")


def _year_to_from_to(year: str) -> tuple[str, str]:
    year = _valid_year(year)
    return (f"{year}-01-01", f"{year}-12-31")


def _get_allowed_categories(db, userEmail: str) -> set[str]:
    """
    Pull allowed categories for this user from settings collection.
    """
    settings_col = db["settings"]
    ensure_settings_indexes(settings_col)
    cats = list_categories(settings_col, userEmail)  # [{name,color}, ...]
    return {c.get("name") for c in cats if c.get("name")}


@expense_bp.post("/add")
@require_auth
def add_expense():
    data = request.get_json(silent=True) or {}
    userEmail = get_authed_email()

    db = get_db(current_app)

    col = db["expenses"]
    ensure_expense_indexes(col)

    try:
        allowed = _get_allowed_categories(db, userEmail)

        exp = create_expense(
            col,
            userEmail=userEmail,
            title=data.get("title"),
            amount=data.get("amount"),
            category=data.get("category"),
            date=data.get("date"),
            notes=data.get("notes", ""),
            allowed_categories=allowed,  # ✅
        )
        return jsonify({"success": True, "message": "Expense added", "expense": exp}), 201
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


@expense_bp.get("")
@require_auth
def list_expenses():
    userEmail = get_authed_email()

    date_from = request.args.get("from")
    date_to = request.args.get("to")
    month = request.args.get("month")
    year = request.args.get("year")

    limit = request.args.get("limit", 200)
    skip = request.args.get("skip", 0)

    try:
        if date_from:
            date_from = _valid_date(date_from)
        if date_to:
            date_to = _valid_date(date_to)

        if (not date_from and not date_to) and month:
            date_from, date_to = _month_to_from_to(month)

        if (not date_from and not date_to) and year:
            date_from, date_to = _year_to_from_to(year)

        db = get_db(current_app)
        col = db["expenses"]
        ensure_expense_indexes(col)

        items = get_expenses(
            col,
            userEmail=userEmail,
            date_from=date_from,
            date_to=date_to,
            limit=limit,
            skip=skip,
        )
        return jsonify({"success": True, "expenses": items}), 200

    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


@expense_bp.put("/<expense_id>")
@require_auth
def edit_expense(expense_id):
    data = request.get_json(silent=True) or {}
    userEmail = get_authed_email()

    db = get_db(current_app)
    col = db["expenses"]
    ensure_expense_indexes(col)

    try:
        allowed = _get_allowed_categories(db, userEmail)

        updated = update_expense(
            col,
            expense_id=expense_id,
            userEmail=userEmail,
            patch=data,
            allowed_categories=allowed,  # ✅
        )
        if not updated:
            return jsonify({"success": False, "message": "Expense not found"}), 404
        return jsonify({"success": True, "message": "Expense updated", "expense": updated}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except InvalidId:
        return jsonify({"success": False, "message": "Invalid expense id"}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


@expense_bp.delete("/<expense_id>")
@require_auth
def remove_expense(expense_id):
    userEmail = get_authed_email()

    db = get_db(current_app)
    col = db["expenses"]
    ensure_expense_indexes(col)

    try:
        ok = delete_expense(col, expense_id=expense_id, userEmail=userEmail)
        if not ok:
            return jsonify({"success": False, "message": "Expense not found"}), 404
        return jsonify({"success": True, "message": "Expense deleted"}), 200
    except InvalidId:
        return jsonify({"success": False, "message": "Invalid expense id"}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500
