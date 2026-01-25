// src/components/AddExpenseForm.jsx
import React from "react";

export default function AddExpenseForm({ expenseForm, setExpenseForm, onSubmit, categories }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <h4 className="font-semibold text-gray-900">Add Expense</h4>
      <p className="text-sm text-gray-500 mt-1">Record a cash out item.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            value={expenseForm.title}
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
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              placeholder="e.g., 120"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
          >
            {categories.map((c) => (
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
            value={expenseForm.notes}
            onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
            placeholder="Any extra detail..."
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gray-900 text-white py-2.5 font-medium hover:bg-gray-800 transition"
        >
          Save Expense
        </button>
      </form>
    </div>
  );
}