// src/components/AddBudgetForm.jsx
import React, { useEffect, useState } from "react";
import { useGlobal } from "../context/GlobalContext";

export default function AddBudgetForm({
  budgetForm,
  setBudgetForm,
  currentMonth,
  isEditing,
  setModalOpen,
}) {
  const { token, prependBudget, fetchBudgets } = useGlobal();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ensure month is always present (prevents empty controlled input)
  useEffect(() => {
    if (!budgetForm?.key && currentMonth) {
      setBudgetForm((prev) => ({ ...prev, key: currentMonth }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  async function saveBudget(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Please sign in again");
      return;
    }

    const month = String(budgetForm?.key || currentMonth || "").trim();
    const amountNum = Number(budgetForm?.amount);

    if (!month) return setError("Month is required");
    if (!Number.isFinite(amountNum) || amountNum <= 0) return setError("Budget must be greater than 0");

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/budgets/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          month,
          amount: amountNum,
          notes: (budgetForm?.notes || "").trim(),
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setError(payload?.message || "Failed to save budget");
        return;
      }

      const created = payload?.budget;

      // ✅ instant UI update
      if (created) prependBudget(created);

      // ✅ optional: sync from server (in case server adjusts shape)
      fetchBudgets().catch(() => {});

      // reset + close
      setBudgetForm({ key: currentMonth, amount: "", notes: "" });
      setModalOpen(false);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mt-1">
        {isEditing ? "Update your monthly budget" : "Set budget for a month"}
      </p>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={saveBudget} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Month</label>
          <input
            type="month"
            required
            disabled={loading}
            value={budgetForm?.key ?? currentMonth ?? ""}
            onChange={(e) => setBudgetForm((prev) => ({ ...prev, key: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Budget Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            disabled={loading}
            value={budgetForm?.amount ?? ""}
            onChange={(e) => setBudgetForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="e.g., 15000"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            rows={3}
            disabled={loading}
            value={budgetForm?.notes ?? ""}
            onChange={(e) => setBudgetForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Budget description..."
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-60"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setBudgetForm((prev) => ({ ...prev, amount: "", notes: "" }));
              setModalOpen(false);
            }}
            className="w-full rounded-xl bg-gray-500 text-white py-2.5 font-medium disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Budget" : "Save Budget"}
          </button>
        </div>
      </form>
    </div>
  );
}
