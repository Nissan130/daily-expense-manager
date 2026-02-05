// src/components/EditExpenseModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { useGlobal } from "../context/GlobalContext";

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Other"];

const getUserToken = () =>
  sessionStorage.getItem("user_token") || localStorage.getItem("user_token") || "";

export default function EditExpenseModal({ open, expense, onClose, onSaved }) {
  const { token, API_BASE } = useGlobal();
  const authToken = token || getUserToken();

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canShow = open && expense;

  useEffect(() => {
    if (!expense) return;
    setError("");
    setForm({
      title: expense.title || "",
      amount: expense.amount ?? "",
      category: expense.category || "Other",
      date: (expense.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      notes: expense.notes || "",
    });
  }, [expense]);

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    const amt = Number(form.amount);
    if (!Number.isFinite(amt) || amt <= 0) return "Amount must be greater than 0";
    if (!form.date) return "Date is required";
    if (!form.category) return "Category is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    if (!authToken) return setError("Please sign in again.");

    setLoading(true);
    try {
      const body = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes || "",
      };

      // Prefer PUT; fallback to PATCH if your backend uses PATCH
      let res = await fetch(`${API_BASE}/api/expenses/${expense._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 405) {
        res = await fetch(`${API_BASE}/api/expenses/${expense._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(body),
        });
      }

      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to update expense");

      // Tell parent to refresh + update UI
      onSaved?.(payload?.expense || body);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (ev) => {
      if (ev.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!canShow) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Edit Expense</h3>
              <p className="text-xs sm:text-sm text-gray-500">Update the selected record</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition"
              aria-label="Close"
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex gap-2">
                <AlertCircle size={18} className="mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                  disabled={loading}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-500 text-white py-2.5 font-medium disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
