// src/components/AddExpenseForm.jsx
import React, { useEffect, useState } from "react";
import { useGlobal } from "../context/GlobalContext";

export default function AddExpenseForm({
  expenseForm,
  setExpenseForm,
  categories = [],
  CategoryDropdown, // optional component injected from Dashboard
  setModalOpen,
  onCreated, // optional callback
  onCancel, // optional callback
}) {
  const { token, prependExpense, API_BASE } = useGlobal();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ ensure default category if not set
  useEffect(() => {
    if (!expenseForm.category) {
      const fallback = categories?.[0] || "Other";
      setExpenseForm((p) => ({ ...p, category: fallback }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories?.length]);

  const validate = () => {
    if (!expenseForm.title?.trim()) return "Title is required";
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) return "Amount must be greater than 0";
    if (!expenseForm.date) return "Date is required";
    if (!expenseForm.category) return "Category is required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    if (!token) {
      setError("You are not logged in. Please sign in again.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/expenses/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: expenseForm.title.trim(),
          amount: Number(expenseForm.amount),
          category: expenseForm.category,
          date: expenseForm.date,
          notes: expenseForm.notes || "",
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setError(payload?.message || "Failed to add expense");
        return;
      }

      const created = payload?.expense;

      if (created) {
        prependExpense(created);
        if (onCreated) onCreated(created);
      }

      // reset form (keep date + category)
      setExpenseForm((prev) => ({
        ...prev,
        title: "",
        amount: "",
        notes: "",
      }));

      setModalOpen(false);
    } catch (e2) {
      setError(e2?.message || "Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError("");
    setExpenseForm((prev) => ({ ...prev, title: "", amount: "", notes: "" }));
    if (onCancel) onCancel();
    setModalOpen(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            value={expenseForm.title || ""}
            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
            placeholder="e.g., Lunch"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              step="0.01"
              value={expenseForm.amount || ""}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              placeholder="e.g., 120"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={expenseForm.date || ""}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        {/* ✅ Category */}
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>

          {CategoryDropdown ? (
            <div className="mt-1">
              <CategoryDropdown
                value={expenseForm.category}
                onChange={(cat) => setExpenseForm({ ...expenseForm, category: cat })}
              />
            </div>
          ) : (
            <select
              value={expenseForm.category || ""}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {(categories?.length ? categories : ["Other"]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            rows={3}
            value={expenseForm.notes || ""}
            onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
            placeholder="Any extra detail..."
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-xl bg-gray-500 text-white py-2.5 font-medium transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
