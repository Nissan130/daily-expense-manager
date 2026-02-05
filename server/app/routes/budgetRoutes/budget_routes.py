# app/routes/budgetRoutes/budgetRoutes.py
from flask import Blueprint, current_app, request, jsonify
from bson.errors import InvalidId

from app.db.mongo import get_db
from app.utils.auth import require_auth, get_authed_email
from app.model.budgetModel.budget_model import (
    ensure_budget_indexes,
    create_budget,
    list_budgets,
)

budget_bp = Blueprint("budgets", __name__, url_prefix="/api/budgets")


@budget_bp.post("/add")
@require_auth
def create_budget_route():
    data = request.get_json(silent=True) or {}
    userEmail = get_authed_email()

    month = data.get("month")
    amount = data.get("amount")
    notes = data.get("notes", "")

    db = get_db(current_app)
    col = db["budgets"]
    ensure_budget_indexes(col)

    try:
        b = create_budget(col, userEmail=userEmail, month=month, amount=amount, notes=notes)
        return jsonify({"success": True, "message": "Budget created", "budget": b}), 201
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


@budget_bp.get("")
@require_auth
def list_all_budgets():
    userEmail = get_authed_email()
    month = request.args.get("month")  # optional filter
    limit = request.args.get("limit", 200)
    skip = request.args.get("skip", 0)

    db = get_db(current_app)
    col = db["budgets"]
    ensure_budget_indexes(col)

    try:
        items = list_budgets(col, userEmail=userEmail, month=month, limit=limit, skip=skip)
        return jsonify({"success": True, "budgets": items}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500


@budget_bp.delete("/<budget_id>")
@require_auth
def delete_budget(budget_id):
    userEmail = get_authed_email()

    db = get_db(current_app)
    col = db["budgets"]
    ensure_budget_indexes(col)

    try:
        ok = delete_budget_by_id(col, userEmail=userEmail, budget_id=budget_id)
        if not ok:
            return jsonify({"success": False, "message": "Budget not found"}), 404
        return jsonify({"success": True, "message": "Budget deleted"}), 200
    except InvalidId:
        return jsonify({"success": False, "message": "Invalid budget id"}), 400
    except Exception:
        return jsonify({"success": False, "message": "Server error"}), 500
