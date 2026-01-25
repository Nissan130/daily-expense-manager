// src/pages/Dashboard.jsx
import { useMemo, useState } from "react";

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Health", "Other"];

const DUMMY_EXPENSES = [
  { _id: "1", title: "Lunch", amount: 120, category: "Food", date: "2026-01-25", notes: "Rice + chicken" },
  { _id: "2", title: "Bus Fare", amount: 40, category: "Transport", date: "2026-01-25", notes: "" },
  { _id: "3", title: "Internet Bill", amount: 1200, category: "Bills", date: "2026-01-24", notes: "Monthly" },
  { _id: "4", title: "Groceries", amount: 560, category: "Shopping", date: "2026-01-21", notes: "Vegetables & fruits" },
  { _id: "5", title: "Medicine", amount: 220, category: "Health", date: "2026-01-20", notes: "" },
  { _id: "6", title: "Snacks", amount: 80, category: "Food", date: "2026-01-19", notes: "" },
];

function fmtMoney(n) {
  const num = Number(n || 0);
  return `৳${num.toFixed(2)}`;
}
function monthKey(dateStr) {
  return (dateStr || "").slice(0, 7); // YYYY-MM
}
function yearKey(dateStr) {
  return (dateStr || "").slice(0, 4); // YYYY
}

// --- Simple SVG Pie (donut) ---
function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y, "L", cx, cy, "Z"].join(" ");
}

function PieChart({ data, centerLabel, size = 220 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  const colors = ["#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB"];

  if (!total) {
    return (
      <div className="h-[240px] flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-500">No data for this period</p>
      </div>
    );
  }

  let startAngle = 0;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const endAngle = startAngle + angle;
    const path = describeArc(cx, cy, r, startAngle, endAngle);
    const slice = { ...d, path, color: colors[i % colors.length] };
    startAngle = endAngle;
    return slice;
  });

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {slices.map((s) => (
          <path key={s.label} d={s.path} fill={s.color} />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.58} fill="white" />
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-gray-900" fontSize="14" fontWeight="700">
          {fmtMoney(total)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-gray-500" fontSize="11">
          {centerLabel}
        </text>
      </svg>

      <div className="w-full">
        <h3 className="text-sm font-semibold text-gray-900">Category breakdown</h3>
        <p className="text-xs text-gray-500 mt-1">Share of spending for the selected period.</p>

        <div className="mt-4 space-y-2">
          {slices
            .slice()
            .sort((a, b) => b.value - a.value)
            .map((s) => {
              const pct = total ? (s.value / total) * 100 : 0;
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-800 truncate">{s.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{fmtMoney(s.value)}</p>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full" style={{ width: `${pct.toFixed(1)}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState(DUMMY_EXPENSES);

  // Dropdown filter for the single summary card + pie chart
  const [period, setPeriod] = useState("month"); // "month" | "year" | "all"

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  // Expense form (modal)
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  // Budget form (modal) + saved budgets (design-only)
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = String(now.getFullYear());

  const [budgets, setBudgets] = useState(() => ({
    // design-only starter budgets
    month: { [currentMonth]: 15000 },
    year: { [currentYear]: 120000 },
  }));

  const totalAllTime = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const totalThisMonth = useMemo(() => {
    return expenses
      .filter((e) => monthKey(e.date) === currentMonth)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses, currentMonth]);

  const totalThisYear = useMemo(() => {
    return expenses
      .filter((e) => yearKey(e.date) === currentYear)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses, currentYear]);

  const selectedTotal = useMemo(() => {
    if (period === "month") return totalThisMonth;
    if (period === "year") return totalThisYear;
    return totalAllTime;
  }, [period, totalThisMonth, totalThisYear, totalAllTime]);

  const selectedLabel = useMemo(() => {
    if (period === "month") return `Spent this month (${currentMonth})`;
    if (period === "year") return `Spent this year (${currentYear})`;
    return "Total spent (All time)";
  }, [period, currentMonth, currentYear]);

  const pieData = useMemo(() => {
    const base = new Map();
    for (const c of CATEGORIES) base.set(c, 0);

    const list =
      period === "month"
        ? expenses.filter((e) => monthKey(e.date) === currentMonth)
        : period === "year"
        ? expenses.filter((e) => yearKey(e.date) === currentYear)
        : expenses;

    list.forEach((e) => {
      const key = CATEGORIES.includes(e.category) ? e.category : "Other";
      base.set(key, (base.get(key) || 0) + Number(e.amount || 0));
    });

    return Array.from(base.entries())
      .map(([label, value]) => ({ label, value }))
      .filter((d) => d.value > 0);
  }, [expenses, period, currentMonth, currentYear]);

  // Budget view (design-only)
  const budgetAmount = useMemo(() => {
    if (period === "month") return budgets.month?.[currentMonth] || 0;
    if (period === "year") return budgets.year?.[currentYear] || 0;
    return 0;
  }, [budgets, period, currentMonth, currentYear]);

  const budgetPct = useMemo(() => {
    if (!budgetAmount) return 0;
    return Math.min(100, (selectedTotal / budgetAmount) * 100);
  }, [selectedTotal, budgetAmount]);

  function openModal() {
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  function addExpense(e) {
    e.preventDefault();
    const payload = {
      _id: crypto.randomUUID(),
      title: expenseForm.title.trim(),
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      date: expenseForm.date,
      notes: expenseForm.notes.trim(),
    };

    if (!payload.title) return alert("Title is required.");
    if (!payload.date) return alert("Date is required.");
    if (!payload.amount || payload.amount <= 0) return alert("Amount must be > 0.");

    setExpenses((prev) => [payload, ...prev]);
    setExpenseForm((prev) => ({
      title: "",
      amount: "",
      category: prev.category,
      date: prev.date,
      notes: "",
    }));
    closeModal();
  }

  const [budgetForm, setBudgetForm] = useState({
    mode: "month", // month | year
    key: currentMonth, // month: YYYY-MM, year: YYYY
    amount: "",
    notes: "",
  });

  function saveBudget(e) {
    e.preventDefault();
    const amount = Number(budgetForm.amount);

    if (!budgetForm.key) return alert("Period is required.");
    if (!amount || amount <= 0) return alert("Budget must be > 0.");

    setBudgets((prev) => {
      const next = { ...prev };
      if (budgetForm.mode === "month") {
        next.month = { ...(next.month || {}), [budgetForm.key]: amount };
      } else {
        next.year = { ...(next.year || {}), [budgetForm.key]: amount };
      }
      return next;
    });

    setBudgetForm((prev) => ({ ...prev, amount: "", notes: "" }));
    closeModal();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of your spending.</p>
          </div>

          {/* Dropdown filter */}
          <div className="w-44">
            <label className="text-xs font-medium text-gray-500">Filter</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Single summary card (based on dropdown) */}
        <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">{selectedLabel}</p>
              <p className="mt-1 text-4xl font-bold text-gray-900">{fmtMoney(selectedTotal)}</p>
              <p className="mt-2 text-sm text-gray-500">
                Change the filter from the dropdown to view different periods.
              </p>
            </div>

            {/* Budget mini card to fill the right side nicely */}
            <div className="w-full sm:w-[360px] rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Budget</p>
                <span className="text-xs text-gray-500">
                  {period === "all" ? "—" : period === "month" ? currentMonth : currentYear}
                </span>
              </div>

              {period === "all" ? (
                <p className="mt-2 text-sm text-gray-500">
                  Budget is shown for Month/Year filters.
                </p>
              ) : budgetAmount ? (
                <>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-700">Used</p>
                    <p className="text-sm font-semibold text-gray-900">{budgetPct.toFixed(0)}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-gray-900" style={{ width: `${budgetPct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <p className="text-gray-600">{fmtMoney(selectedTotal)} spent</p>
                    <p className="font-semibold text-gray-900">{fmtMoney(budgetAmount)} budget</p>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No budget set for this period. Tap “+” to add one.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Balanced layout: chart left, small cards right (no empty right side) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie chart card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Expenses by category</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing:{" "}
              <span className="font-medium text-gray-900">
                {period === "month" ? currentMonth : period === "year" ? currentYear : "All time"}
              </span>
            </p>

            <div className="mt-6">
              <PieChart
                data={pieData}
                centerLabel={period === "month" ? "This month" : period === "year" ? "This year" : "All time"}
              />
            </div>
          </div>

          {/* Right column cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Quick actions</h3>
              <p className="text-sm text-gray-500 mt-1">Add an expense or set a budget.</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={openModal}
                  className="rounded-2xl bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-800 transition"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={openModal}
                  className="rounded-2xl border border-gray-300 bg-white py-3 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Set Budget
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Tip</p>
                <p className="text-sm text-gray-700 mt-1">
                  Keep budgets monthly—your category chart becomes more meaningful.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Selected period</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedLabel}</p>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{fmtMoney(selectedTotal)}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating + button (position improved: centered on mobile, aligned to container on desktop) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[calc((100vw-72rem)/2+1.25rem)] z-30">
        <button
          onClick={openModal}
          className="h-14 w-14 rounded-2xl bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition flex items-center justify-center"
          aria-label="Add expense or budget"
          type="button"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-label="Close modal backdrop"
          />

          {/* Modal panel */}
          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-4">
            <div className="w-full sm:max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add</h3>
                  <p className="text-sm text-gray-500">Expense and budget options</p>
                </div>
                <button
                  onClick={closeModal}
                  type="button"
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Expense */}
                <div className="rounded-2xl border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900">Add Expense</h4>
                  <p className="text-sm text-gray-500 mt-1">Record a cash out item.</p>

                  <form onSubmit={addExpense} className="mt-4 space-y-4">
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

                {/* Set Budget */}
                <div className="rounded-2xl border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900">Set Budget</h4>
                  <p className="text-sm text-gray-500 mt-1">Plan spending for month or year.</p>

                  <form onSubmit={saveBudget} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select
                          value={budgetForm.mode}
                          onChange={(e) => {
                            const mode = e.target.value;
                            setBudgetForm((prev) => ({
                              ...prev,
                              mode,
                              key: mode === "month" ? currentMonth : currentYear,
                            }));
                          }}
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                        >
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          {budgetForm.mode === "month" ? "Month" : "Year"}
                        </label>
                        {budgetForm.mode === "month" ? (
                          <input
                            type="month"
                            value={budgetForm.key}
                            onChange={(e) => setBudgetForm((prev) => ({ ...prev, key: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                          />
                        ) : (
                          <input
                            type="number"
                            value={budgetForm.key}
                            onChange={(e) => setBudgetForm((prev) => ({ ...prev, key: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                            placeholder="e.g., 2026"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Budget Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={budgetForm.amount}
                        onChange={(e) => setBudgetForm((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="e.g., 15000"
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                      <textarea
                        rows={3}
                        value={budgetForm.notes}
                        onChange={(e) => setBudgetForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="e.g., January budget"
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl border border-gray-300 bg-white py-2.5 font-medium hover:bg-gray-50 transition"
                    >
                      Save Budget
                    </button>

                    <p className="text-xs text-gray-500">Design-only (later you can store budgets in DB).</p>
                  </form>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">Tip: Use Month budgets for best tracking.</p>
                <button
                  onClick={closeModal}
                  type="button"
                  className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
