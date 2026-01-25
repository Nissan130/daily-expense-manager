// src/components/AddBudgetForm.jsx
import React from "react";

export default function AddBudgetForm({ budgetForm, setBudgetForm, onSubmit, currentMonth, currentYear, isEditing = false }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <h4 className="font-semibold text-gray-900">{isEditing ? "Edit Budget" : "Add Budget"}</h4>
      <p className="text-sm text-gray-500 mt-1">{isEditing ? "Update your budget details" : "Set budget for a period."}</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Period Type</label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setBudgetForm({ ...budgetForm, mode: "month", key: currentMonth })}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                budgetForm.mode === "month"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBudgetForm({ ...budgetForm, mode: "year", key: currentYear })}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                budgetForm.mode === "year"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            {budgetForm.mode === "month" ? "Month" : "Year"}
          </label>
          {budgetForm.mode === "month" ? (
            <input
              type="month"
              required
              value={budgetForm.key}
              onChange={(e) => setBudgetForm({ ...budgetForm, key: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          ) : (
            <input
              type="number"
              required
              min="2000"
              max="2100"
              value={budgetForm.key}
              onChange={(e) => setBudgetForm({ ...budgetForm, key: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="2026"
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Budget Amount</label>
          <input
            type="number"
            step="0.01"
            required
            value={budgetForm.amount}
            onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
            placeholder="e.g., 15000"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            rows={3}
            value={budgetForm.notes}
            onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
            placeholder="Budget description..."
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 transition"
        >
          {isEditing ? "Update Budget" : "Save Budget"}
        </button>
      </form>
    </div>
  );
}