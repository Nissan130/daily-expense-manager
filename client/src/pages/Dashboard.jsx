// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import AddExpenseForm from "../components/AddExpenseForm";
import AddBudgetForm from "../components/AddBudgetForm";
import { PieChart, TrendingUp, Calendar, Wallet, TrendingDown, Edit2, AlertCircle } from "lucide-react";

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Health", "Other"];

const DUMMY_EXPENSES = [
  { _id: "1", title: "Lunch", amount: 120, category: "Food", date: "2026-01-25", notes: "Rice + chicken" },
  { _id: "2", title: "Bus Fare", amount: 40, category: "Transport", date: "2026-01-25", notes: "" },
  { _id: "3", title: "Internet Bill", amount: 1200, category: "Bills", date: "2026-01-24", notes: "Monthly" },
  { _id: "4", title: "Groceries", amount: 560, category: "Shopping", date: "2026-01-21", notes: "Vegetables & fruits" },
  { _id: "5", title: "Medicine", amount: 220, category: "Health", date: "2026-01-20", notes: "" },
  { _id: "6", title: "Snacks", amount: 80, category: "Food", date: "2026-01-19", notes: "" },
];

const CATEGORY_COLORS = {
  Food: "#10B981",
  Transport: "#3B82F6",
  Bills: "#8B5CF6",
  Shopping: "#F59E0B",
  Health: "#EF4444",
  Other: "#6B7280"
};

const CATEGORY_ICONS = {
  Food: "🍽️",
  Transport: "🚗",
  Bills: "📄",
  Shopping: "🛍️",
  Health: "🏥",
  Other: "📦"
};

function fmtMoney(n) {
  const num = Number(n || 0);
  return `৳${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthKey(dateStr) {
  return (dateStr || "").slice(0, 7);
}

function yearKey(dateStr) {
  return (dateStr || "").slice(0, 4);
}

function PieChartComponent({ data, centerLabel, size = 220 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const innerR = r * 0.6;

  if (!total) {
    return (
      <div className="h-[240px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50">
        <PieChart className="w-12 h-12 text-gray-400 mb-2" />
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
    
    const slice = { ...d, path, color: CATEGORY_COLORS[d.label] || "#6B7280" };
    startAngle = endAngle;
    return slice;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
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
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg">
                      {CATEGORY_ICONS[s.label]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{s.label}</p>
                        <p className="text-sm font-semibold text-gray-900">{fmtMoney(s.value)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${pct.toFixed(1)}%`, 
                              backgroundColor: s.color 
                            }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">
                          {pct.toFixed(1)}%
                        </span>
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
  const [expenses, setExpenses] = useState(DUMMY_EXPENSES);
  const [period, setPeriod] = useState("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("expense");
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = String(now.getFullYear());

  const [budgets, setBudgets] = useState({
    month: { [currentMonth]: 15000 },
    year: { [currentYear]: 120000 },
  });

  const [budgetForm, setBudgetForm] = useState({
    mode: "month",
    key: currentMonth,
    amount: "",
    notes: "",
  });

  // Prevent background scroll
  useEffect(() => {
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [modalOpen]);

  // Calculations
  const totalAllTime = useMemo(() => 
    expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), 
    [expenses]
  );

  const totalThisMonth = useMemo(() => 
    expenses
      .filter((e) => monthKey(e.date) === currentMonth)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0), 
    [expenses, currentMonth]
  );

  const totalThisYear = useMemo(() => 
    expenses
      .filter((e) => yearKey(e.date) === currentYear)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0), 
    [expenses, currentYear]
  );

  const selectedTotal = useMemo(() => {
    if (period === "month") return totalThisMonth;
    if (period === "year") return totalThisYear;
    return totalAllTime;
  }, [period, totalThisMonth, totalThisYear, totalAllTime]);

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

  const budgetAmount = useMemo(() => {
    if (period === "month") return budgets.month?.[currentMonth] || 0;
    if (period === "year") return budgets.year?.[currentYear] || 0;
    return 0;
  }, [budgets, period, currentMonth, currentYear]);

  const budgetPct = useMemo(() => {
    if (!budgetAmount) return 0;
    return Math.min(100, (selectedTotal / budgetAmount) * 100);
  }, [selectedTotal, budgetAmount]);

  // Calculate if budget is exceeded
  const isBudgetExceeded = useMemo(() => {
    return budgetAmount > 0 && selectedTotal > budgetAmount;
  }, [selectedTotal, budgetAmount]);

  // Calculate extra cost amount (only positive when exceeded)
  const extraCostAmount = useMemo(() => {
    if (!isBudgetExceeded) return 0;
    return selectedTotal - budgetAmount;
  }, [selectedTotal, budgetAmount, isBudgetExceeded]);

  // Calculate remaining budget (negative when exceeded)
  const remainingBudget = useMemo(() => {
    return budgetAmount - selectedTotal;
  }, [budgetAmount, selectedTotal]);

  const averageDailySpending = useMemo(() => {
    if (period === "month") return totalThisMonth / now.getDate();
    if (period === "year") return totalThisYear / Math.ceil((now - new Date(currentYear, 0, 1)) / (1000 * 60 * 60 * 24));
    return totalAllTime / 365;
  }, [totalThisMonth, totalThisYear, totalAllTime, period, currentYear]);

  function openModal() {
    setModalOpen(true);
    setModalTab("expense");
  }

  function closeModal() {
    setModalOpen(false);
    setIsEditingBudget(false);
    setBudgetForm({
      mode: "month",
      key: currentMonth,
      amount: "",
      notes: "",
    });
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

    setBudgetForm({
      mode: "month",
      key: currentMonth,
      amount: "",
      notes: "",
    });
    setIsEditingBudget(false);
    closeModal();
  }

  function editCurrentBudget() {
    const currentBudget = period === "month" 
      ? { type: "month", period: currentMonth, amount: budgetAmount }
      : { type: "year", period: currentYear, amount: budgetAmount };
    
    if (currentBudget.amount > 0) {
      setIsEditingBudget(true);
      setBudgetForm({
        mode: currentBudget.type,
        key: currentBudget.period,
        amount: currentBudget.amount.toString(),
        notes: "",
      });
      setModalTab("budget");
      setModalOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50  top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Manager</h1>
              <p className="text-sm text-gray-600 mt-1">Track and manage your spending efficiently</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-48">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{fmtMoney(selectedTotal)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gray-900/10 flex items-center justify-center">
                <Wallet className="text-gray-900" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {period === "month" ? "This month" : period === "year" ? "This year" : "All time"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget Used</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{budgetPct.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPct > 100 ? 'bg-red-500' : budgetPct > 90 ? 'bg-red-400' : budgetPct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
            {isBudgetExceeded && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                <AlertCircle size={14} />
                <span>Exceeded by {fmtMoney(extraCostAmount)}</span>
              </div>
            )}
          </div>

          <div className={`bg-white rounded-2xl border ${isBudgetExceeded ? 'border-red-200' : 'border-gray-200'} p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Remaining Budget</p>
                <p className={`mt-2 text-3xl font-bold ${isBudgetExceeded ? 'text-red-600' : 'text-gray-900'}`}>
                  {isBudgetExceeded ? `-${fmtMoney(extraCostAmount)}` : fmtMoney(Math.max(0, remainingBudget))}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${isBudgetExceeded ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center`}>
                {isBudgetExceeded ? (
                  <AlertCircle className="text-red-600" size={24} />
                ) : (
                  <TrendingDown className="text-green-600" size={24} />
                )}
              </div>
            </div>
            {isBudgetExceeded ? (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                  <AlertCircle size={14} />
                  <span>Budget exceeded</span>
                </div>
                <p className="text-xs text-gray-500">
                  You've spent {fmtMoney(extraCostAmount)} more than your budget of {fmtMoney(budgetAmount)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-4">
                {budgetAmount > 0 ? `Out of ${fmtMoney(budgetAmount)}` : "No budget set"}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Daily</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{fmtMoney(averageDailySpending)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Average spending per day</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Spending Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Visual breakdown of your expenses</p>
              </div>
              <PieChartComponent
                data={pieData}
                centerLabel={period === "month" ? "This Month" : period === "year" ? "This Year" : "All Time"}
                size={260}
              />
            </div>
          </div>

          {/* Right Column - Budget Section */}
          <div className="space-y-8">
            {/* Single Budget Card */}
            <div className={`bg-white rounded-2xl border ${isBudgetExceeded ? 'border-red-200' : 'border-gray-200'} p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Budget</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {period === "month" ? currentMonth : period === "year" ? currentYear : "All time"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {budgetAmount > 0 && (
                    <button
                      onClick={editCurrentBudget}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                      title="Edit budget"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setModalTab("budget");
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    {budgetAmount > 0 ? "Add New" : "Set Budget"}
                  </button>
                </div>
              </div>
              
              {budgetAmount > 0 ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className={`font-semibold ${isBudgetExceeded ? 'text-red-600' : 'text-gray-900'}`}>
                          {budgetPct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            budgetPct > 100 ? 'bg-red-600' : 
                            budgetPct > 90 ? 'bg-red-400' : 
                            budgetPct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetPct, 100)}%` }}
                        />
                      </div>
                      {isBudgetExceeded && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle size={14} />
                          <span>Exceeded by {fmtMoney(extraCostAmount)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">Spent</p>
                        <p className={`text-lg font-semibold ${isBudgetExceeded ? 'text-red-600' : 'text-gray-900'}`}>
                          {fmtMoney(selectedTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className={`text-lg font-semibold ${isBudgetExceeded ? 'text-red-600' : 'text-gray-900'}`}>
                          {isBudgetExceeded ? `-${fmtMoney(extraCostAmount)}` : fmtMoney(Math.max(0, remainingBudget))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Budget</p>
                          <p className="text-2xl font-bold text-gray-900">{fmtMoney(budgetAmount)}</p>
                          {isBudgetExceeded && (
                            <div className="mt-1 text-xs text-red-600">
                              You've exceeded by {fmtMoney(extraCostAmount)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={editCurrentBudget}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit budget"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Wallet className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 mb-4">No budget set for this period</p>
                  <button
                    onClick={() => {
                      setModalTab("budget");
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    Set Budget
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Plus Button */}
      <button
        onClick={openModal}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-40"
        aria-label="Add new"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setModalTab("expense")}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      modalTab === "expense" 
                        ? "text-gray-900 border-b-2 border-gray-900" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={() => setModalTab("budget")}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      modalTab === "budget" 
                        ? "text-gray-900 border-b-2 border-gray-900" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {isEditingBudget ? "Edit Budget" : "Add Budget"}
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {modalTab === "expense" ? (
                  <AddExpenseForm
                    expenseForm={expenseForm}
                    setExpenseForm={setExpenseForm}
                    onSubmit={addExpense}
                    categories={CATEGORIES}
                  />
                ) : (
                  <AddBudgetForm
                    budgetForm={budgetForm}
                    setBudgetForm={setBudgetForm}
                    onSubmit={saveBudget}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    isEditing={isEditingBudget}
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={modalTab === "expense" ? addExpense : saveBudget}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {modalTab === "expense" ? "Save Expense" : (isEditingBudget ? "Update Budget" : "Save Budget")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}