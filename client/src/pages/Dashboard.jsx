// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import AddExpenseForm from "../components/AddExpenseForm";
import AddBudgetForm from "../components/AddBudgetForm";
import { PieChart, Calendar, Wallet, TrendingDown, AlertCircle, Plus, X, Trash2 } from "lucide-react";
import { useGlobal } from "../context/GlobalContext";

const getUserToken = () => sessionStorage.getItem("user_token") || localStorage.getItem("user_token") || "";

function fmtMoney(n) {
  const num = Number(n || 0);
  return `৳${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthKey(dateStr) {
  return (dateStr || "").slice(0, 7);
}
function yearKey(dateStr) {
  return (dateStr || "").slice(0, 4);
}
function inRange(dateStr, from, to) {
  if (!dateStr) return false;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}
function monthFromDate(dateStr) {
  return (dateStr || "").slice(0, 7);
}
function monthInRange(month, fromDate, toDate) {
  if (!month) return false;
  const fromMonth = fromDate ? monthFromDate(fromDate) : "";
  const toMonth = toDate ? monthFromDate(toDate) : "";
  if (fromMonth && month < fromMonth) return false;
  if (toMonth && month > toMonth) return false;
  return true;
}

/**
 * ✅ Category dropdown (name + color) with:
 * - "+ Add new category"
 * - inline add form
 * - trash icon per category to delete
 */
function CategoryDropdown({ value, onChange, categories, onAddCategory, onDeleteCategory, disabled }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState("");
  const [err, setErr] = useState("");

  const selected = categories.find((c) => c.name === value) || null;

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest(".cat-dd")) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const submitAdd = async () => {
    setErr("");
    const clean = (name || "").trim();
    if (!clean) return setErr("Category name required");

    setSaving(true);
    try {
      const createdName = await onAddCategory(clean);
      setName("");
      setAdding(false);
      setOpen(false);
      if (createdName) onChange(createdName);
    } catch (e) {
      setErr(e?.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catName) => {
    setErr("");
    const ok = window.confirm(`Delete category "${catName}"?`);
    if (!ok) return;

    setDeletingName(catName);
    try {
      await onDeleteCategory(catName);

      // if current selected got deleted -> choose first category if exists
      if (value === catName) {
        const remaining = categories.filter((c) => c.name !== catName);
        onChange(remaining?.[0]?.name || "Other");
      }
    } catch (e) {
      setErr(e?.message || "Failed to delete category");
    } finally {
      setDeletingName("");
    }
  };

  return (
    <div className="cat-dd relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-60"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: selected?.color || "#6B7280" }}
          />
          <span className="truncate text-gray-900">{selected?.name || value || "Select category"}</span>
        </div>
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {/* Add new */}
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setErr("");
            }}
            className="w-full px-4 py-3 flex items-center gap-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            <Plus size={16} />
            Add new category
          </button>

          {adding && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Education"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setErr("");
                    setName("");
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100"
                  aria-label="Cancel add"
                >
                  <X size={16} />
                </button>
              </div>

              {err && <div className="mt-2 text-xs text-red-600">{err}</div>}

              <button
                type="button"
                onClick={submitAdd}
                disabled={saving}
                className="mt-3 w-full rounded-xl bg-gray-900 text-white py-2 text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save category"}
              </button>
            </div>
          )}

          <div className="max-h-64 overflow-auto border-t border-gray-100">
            {categories.map((c) => (
              <div
                key={c.name}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                  c.name === value ? "bg-gray-50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.name);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left"
                >
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: c.color || "#6B7280" }} />
                  <span className="truncate text-sm text-gray-900">{c.name}</span>
                </button>

                <div className="flex items-center gap-2 pl-3">
                  {c.name === value && <span className="text-xs text-gray-500">Selected</span>}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c.name);
                    }}
                    disabled={deletingName === c.name}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-60"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {err && !adding && <div className="px-4 py-2 text-xs text-red-600 border-t border-gray-100">{err}</div>}
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PieChartComponent({ data, centerLabel, size = 220, colorByLabel }) {
  const [chartSize, setChartSize] = useState(size);

  useEffect(() => {
    const updateChartSize = () => {
      if (window.innerWidth < 640) setChartSize(180);
      else if (window.innerWidth < 768) setChartSize(200);
      else if (window.innerWidth < 1024) setChartSize(220);
      else setChartSize(260);
    };
    updateChartSize();
    window.addEventListener("resize", updateChartSize);
    return () => window.removeEventListener("resize", updateChartSize);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = chartSize / 2;
  const cy = chartSize / 2;
  const r = chartSize / 2 - 10;
  const innerR = r * 0.6;

  if (!total) {
    return (
      <div className="h-[240px] sm:h-[280px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50">
        <PieChart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No expenses for this period</p>
      </div>
    );
  }

  let startAngle = 0;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);

    const innerX1 = cx + innerR * Math.cos((startAngle * Math.PI) / 180);
    const innerY1 = cy + innerR * Math.sin((startAngle * Math.PI) / 180);
    const innerX2 = cx + innerR * Math.cos((endAngle * Math.PI) / 180);
    const innerY2 = cy + innerR * Math.sin((endAngle * Math.PI) / 180);

    const path = `
      M ${innerX1} ${innerY1}
      L ${x1} ${y1}
      A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
      L ${innerX2} ${innerY2}
      A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerX1} ${innerY1}
      Z
    `;

    const color = colorByLabel?.(d.label) || "#6B7280";
    startAngle = endAngle;
    return { ...d, path, color };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
      <div className="relative shrink-0">
        <svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`} className="drop-shadow-sm">
          {slices.map((s) => (
            <path key={s.label} d={s.path} fill={s.color} className="transition-all hover:opacity-90" />
          ))}
          <circle cx={cx} cy={cy} r={innerR * 0.9} fill="white" />
          <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900" fontSize="18" fontWeight="700">
            {fmtMoney(total)}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-gray-500" fontSize="12">
            {centerLabel}
          </text>
        </svg>
      </div>

      <div className="flex-1 w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Breakdown</h3>
        <p className="text-sm text-gray-500 mb-6">Share of spending for the selected period</p>

        <div className="space-y-4">
          {slices
            .slice()
            .sort((a, b) => b.value - a.value)
            .map((s) => {
              const pct = total ? (s.value / total) * 100 : 0;
              return (
                <div key={s.label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{s.label}</p>
                        <p className="text-sm font-semibold text-gray-900">{fmtMoney(s.value)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct.toFixed(1)}%`, backgroundColor: s.color }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">{pct.toFixed(1)}%</span>
                      </div>
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
  const {
    API_BASE,
    user,

    dashboardPeriod: period,
    setDashboardPeriod: setPeriod,
    dashboardRange: customRange,
    setDashboardRange: setCustomRange,

    expenses,
    expensesLoading,
    expensesError,
    fetchExpenses,

    budgets,
    budgetsLoading,
    budgetsError,
    fetchBudgets,
  } = useGlobal();

  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("expense");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = String(now.getFullYear());

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [budgetForm, setBudgetForm] = useState({
    key: currentMonth,
    amount: "",
    notes: "",
  });

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [modalOpen]);

  useEffect(() => {
    if (period !== "custom" && (customRange?.from || customRange?.to)) {
      setCustomRange({ from: "", to: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  function buildExpenseQueryForPeriod() {
    if (period === "month") {
      const from = `${currentMonth}-01`;
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const to = `${currentMonth}-${String(last).padStart(2, "0")}`;
      return { from, to };
    }
    if (period === "year") return { from: `${currentYear}-01-01`, to: `${currentYear}-12-31` };
    if (period === "custom") return { from: customRange.from || "", to: customRange.to || "" };
    return { from: "", to: "" };
  }

  const fetchCategories = async () => {
    const token = getUserToken();
    if (!token) return;

    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to load categories");

      const cats = Array.isArray(payload?.categories) ? payload.categories : [];
      setCategories(cats);

      if (!expenseForm.category && cats.length) {
        setExpenseForm((p) => ({ ...p, category: cats[0].name }));
      }
    } catch (e) {
      setPageError(e?.message || "Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const addNewCategory = async (name) => {
    const token = getUserToken();
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_BASE}/api/settings/categories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new Error(payload?.message || "Failed to add category");

    const cats = Array.isArray(payload?.categories) ? payload.categories : [];
    setCategories(cats);
    return name;
  };

  const deleteCategory = async (name) => {
    const token = getUserToken();
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_BASE}/api/settings/categories/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new Error(payload?.message || "Failed to delete category");

    const cats = Array.isArray(payload?.categories) ? payload.categories : [];
    setCategories(cats);
  };

  useEffect(() => {
    const token = getUserToken();
    if (!token) return;

    setPageError("");
    (async () => {
      try {
        await Promise.all([fetchBudgets(), fetchExpenses(buildExpenseQueryForPeriod())]);
        await fetchCategories();
      } catch (e) {
        setPageError(e?.message || "Failed to load dashboard data");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.email, API_BASE]);

  useEffect(() => {
    const token = getUserToken();
    if (!token) return;

    setPageError("");
    fetchExpenses(buildExpenseQueryForPeriod()).catch((e) => setPageError(e?.message || "Failed to load expenses"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, currentMonth, currentYear, customRange.from, customRange.to]);

  useEffect(() => {
    if (expensesError) setPageError(expensesError);
  }, [expensesError]);

  useEffect(() => {
    if (budgetsError) setPageError(budgetsError);
  }, [budgetsError]);

  const filteredExpenses = useMemo(() => {
    if (period === "month") return expenses.filter((e) => monthKey(e.date) === currentMonth);
    if (period === "year") return expenses.filter((e) => yearKey(e.date) === currentYear);
    if (period === "custom") return expenses.filter((e) => inRange(e.date, customRange.from, customRange.to));
    return expenses;
  }, [expenses, period, currentMonth, currentYear, customRange.from, customRange.to]);

  const selectedTotal = useMemo(() => filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), [filteredExpenses]);

  const pieData = useMemo(() => {
    const base = new Map();
    const names = categories.map((c) => c.name);
    const keys = names.length ? names : ["Other"];
    keys.forEach((k) => base.set(k, 0));

    filteredExpenses.forEach((e) => {
      const key = base.has(e.category) ? e.category : "Other";
      if (!base.has("Other")) base.set("Other", 0);
      base.set(key, (base.get(key) || 0) + Number(e.amount || 0));
    });

    return Array.from(base.entries())
      .map(([label, value]) => ({ label, value }))
      .filter((d) => d.value > 0);
  }, [filteredExpenses, categories]);

  const colorByLabel = (label) => categories.find((c) => c.name === label)?.color || "#6B7280";

  const budgetTotalForSelectedPeriod = useMemo(() => {
    if (!budgets?.length) return 0;

    if (period === "month") return budgets.filter((b) => b.month === currentMonth).reduce((sum, b) => sum + Number(b.amount || 0), 0);

    if (period === "year") return budgets.filter((b) => (b.month || "").startsWith(currentYear)).reduce((sum, b) => sum + Number(b.amount || 0), 0);

    if (period === "custom") {
      return budgets
        .filter((b) => monthInRange(b.month, customRange.from, customRange.to))
        .reduce((sum, b) => sum + Number(b.amount || 0), 0);
    }

    return budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  }, [budgets, period, currentMonth, currentYear, customRange.from, customRange.to]);

  const isBudgetExceeded = useMemo(() => budgetTotalForSelectedPeriod > 0 && selectedTotal > budgetTotalForSelectedPeriod, [selectedTotal, budgetTotalForSelectedPeriod]);
  const extraCostAmount = useMemo(() => (isBudgetExceeded ? selectedTotal - budgetTotalForSelectedPeriod : 0), [selectedTotal, budgetTotalForSelectedPeriod, isBudgetExceeded]);
  const remainingBudget = useMemo(() => budgetTotalForSelectedPeriod - selectedTotal, [budgetTotalForSelectedPeriod, selectedTotal]);

  const averageDailySpending = useMemo(() => {
    if (period === "month") return selectedTotal / Math.max(1, now.getDate());
    if (period === "year") return selectedTotal / 365;
    if (period === "custom") {
      const from = customRange.from ? new Date(customRange.from) : null;
      const to = customRange.to ? new Date(customRange.to) : null;
      if (from && to) {
        const days = Math.max(1, Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1);
        return selectedTotal / days;
      }
      return selectedTotal / Math.max(1, now.getDate());
    }
    return selectedTotal / 365;
  }, [period, selectedTotal, now, customRange.from, customRange.to]);

  const periodLabel = useMemo(() => {
    if (period === "month") return "This Month";
    if (period === "year") return "This Year";
    if (period === "custom") return "Custom";
    return "All Time";
  }, [period]);

  function openModal() {
    setModalOpen(true);
    setModalTab("expense");
  }

  function closeModal() {
    setModalOpen(false);
    setBudgetForm({ key: currentMonth, amount: "", notes: "" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expense Manager</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Track and manage your spending efficiently</p>
              {pageError && <div className="mt-2 text-xs text-red-600">{pageError}</div>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>

              {period === "custom" && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={customRange.from}
                    onChange={(e) => setCustomRange((p) => ({ ...p, from: e.target.value }))}
                    className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <input
                    type="date"
                    value={customRange.to}
                    onChange={(e) => setCustomRange((p) => ({ ...p, to: e.target.value }))}
                    className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Spent</p>
                <p className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900">{fmtMoney(selectedTotal)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gray-900/10 flex items-center justify-center">
                <Wallet className="text-gray-900" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-2">{expensesLoading ? "Loading expenses..." : periodLabel}</p>
          </div>

          <div className={`bg-white rounded-2xl border ${isBudgetExceeded ? "border-red-200" : "border-gray-200"} p-2 sm:p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Remaining Budget</p>
                <p className={`mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-2xl font-bold ${isBudgetExceeded ? "text-red-600" : "text-gray-900"}`}>
                  {isBudgetExceeded ? `-${fmtMoney(extraCostAmount)}` : fmtMoney(Math.max(0, remainingBudget))}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${isBudgetExceeded ? "bg-red-100" : "bg-green-100"} flex items-center justify-center`}>
                {isBudgetExceeded ? <AlertCircle className="text-red-600" size={20} /> : <TrendingDown className="text-green-600" size={20} />}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2 sm:mt-2">
              {budgetsLoading
                ? "Loading budgets..."
                : budgetTotalForSelectedPeriod > 0
                ? `Out of ${fmtMoney(budgetTotalForSelectedPeriod)}`
                : "No budget set for this period"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Avg. Daily</p>
                <p className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900">{fmtMoney(averageDailySpending)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-2">Average spending per day</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Spending Overview</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Visual breakdown of your expenses</p>
              </div>
              <PieChartComponent data={pieData} centerLabel={period === "custom" ? "Custom Range" : periodLabel} colorByLabel={colorByLabel} />
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">{/* keep your existing budget UI here */}</div>
        </div>
      </main>

      <button
        onClick={openModal}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-40 cursor-pointer"
        aria-label="Add new"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setModalTab("expense")}
                    className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                      modalTab === "expense" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={() => setModalTab("budget")}
                    className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                      modalTab === "budget" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Add Budget
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {modalTab === "expense" ? (
                  <AddExpenseForm
                    expenseForm={expenseForm}
                    setExpenseForm={setExpenseForm}
                    categories={categories.map((c) => c.name)}
                    CategoryDropdown={(props) => (
                      <CategoryDropdown
                        {...props}
                        categories={categories}
                        disabled={categoriesLoading}
                        onAddCategory={addNewCategory}
                        onDeleteCategory={deleteCategory}
                      />
                    )}
                    setModalOpen={setModalOpen}
                    onCancel={closeModal}
                  />
                ) : (
                  <AddBudgetForm
                    budgetForm={budgetForm}
                    setBudgetForm={setBudgetForm}
                    currentMonth={currentMonth}
                    isEditing={false}
                    setModalOpen={setModalOpen}
                  />
                )}
              </div>

              {modalTab === "expense" && categoriesLoading && <div className="px-6 pb-5 text-xs text-gray-500">Loading categories…</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
