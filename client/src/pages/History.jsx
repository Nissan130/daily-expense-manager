// src/pages/History.jsx
import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useGlobal } from "../context/GlobalContext";
import EditExpenseModal from "../components/EditExpenseModal";

const CATEGORIES = ["All", "Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Other"];
const CATEGORY_COLORS = {
  Food: "#10B981",
  Transport: "#3B82F6",
  Bills: "#8B5CF6",
  Shopping: "#F59E0B",
  Health: "#EF4444",
  Entertainment: "#EC4899",
  Other: "#6B7280",
};

function fmtMoney(n) {
  const num = Number(n || 0);
  return `৳${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

export default function History() {
  const {
    token,
    API_BASE,

    // ✅ ALL expenses (must be full list for correct Year/Custom totals)
    allExpenses,
    allExpensesLoading,
    allExpensesError,
    fetchAllExpenses,

    // ✅ persisted selection from dashboard
    dashboardPeriod,
    dashboardRange,
  } = useGlobal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateSort, setDateSort] = useState("desc");
  const [amountSort, setAmountSort] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const [pageError, setPageError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  // inside History() states
  const [editOpen, setEditOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);


  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = String(now.getFullYear());

  useEffect(() => {
    if (!token) return;
    fetchAllExpenses().catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (allExpensesError) setPageError(allExpensesError);
  }, [allExpensesError]);

  const periodLabel = useMemo(() => {
    if (dashboardPeriod === "month") return "This Month";
    if (dashboardPeriod === "year") return "This Year";
    if (dashboardPeriod === "custom") return "Custom Range";
    return "All Time";
  }, [dashboardPeriod]);

  const list = useMemo(() => (Array.isArray(allExpenses) ? allExpenses : []), [allExpenses]);

  const totalAllTime = useMemo(
    () => list.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [list]
  );

  // ✅ This is the value you show in header (based on persisted selection)
  const selectedPeriodTotal = useMemo(() => {
    if (dashboardPeriod === "month") {
      return list
        .filter((e) => monthKey(e.date) === currentMonth)
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    }

    if (dashboardPeriod === "year") {
      return list
        .filter((e) => yearKey(e.date) === currentYear)
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    }

    if (dashboardPeriod === "custom") {
      const from = dashboardRange?.from || "";
      const to = dashboardRange?.to || "";
      return list
        .filter((e) => inRange(e.date, from, to))
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    }

    return totalAllTime;
  }, [dashboardPeriod, dashboardRange?.from, dashboardRange?.to, list, currentMonth, currentYear, totalAllTime]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...list];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((expense) => {
        const title = (expense.title || "").toLowerCase();
        const notes = (expense.notes || "").toLowerCase();
        const category = (expense.category || "").toLowerCase();
        return title.includes(query) || notes.includes(query) || category.includes(query);
      });
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((expense) => (expense.category || "Other") === selectedCategory);
    }

    filtered.sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return dateSort === "desc" ? db - da : da - db;
    });

    if (amountSort === "desc") filtered.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
    if (amountSort === "asc") filtered.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));

    return filtered;
  }, [list, searchQuery, selectedCategory, dateSort, amountSort]);

  const toggleDateSort = () => {
    setDateSort((p) => (p === "desc" ? "asc" : "desc"));
    setAmountSort(null);
  };

  const toggleAmountSort = () => {
    setAmountSort((p) => (p === null ? "desc" : p === "desc" ? "asc" : null));
    setDateSort("desc");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setDateSort("desc");
    setAmountSort(null);
  };

  const toggleMenu = (id) => setActiveMenu((p) => (p === id ? null : id));
  const handleClickOutside = (e) => {
    if (!e.target.closest(".menu-container")) setActiveMenu(null);
  };

  // replace your handleEditExpense
  const handleEditExpense = (id) => {
    setActiveMenu(null);
    const found = list.find((e) => String(e._id) === String(id));
    if (!found) {
      setPageError("Expense not found");
      return;
    }
    setEditExpense(found);
    setEditOpen(true);
  };
  // add this helper
  const closeEdit = () => {
    setEditOpen(false);
    setEditExpense(null);
  };
  // add this callback (after saving, refresh list)
  const onEditSaved = async () => {
    // safest: refetch full list so totals + list update correctly
    await fetchAllExpenses().catch(() => { });
  };


  const handleDeleteExpense = async (id) => {
    setActiveMenu(null);
    if (!token) return setPageError("Please sign in again");

    const ok = window.confirm("Delete this expense? This cannot be undone.");
    if (!ok) return;

    setDeletingId(id);
    setPageError("");

    try {
      const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to delete expense");

      await fetchAllExpenses();
    } catch (err) {
      setPageError(err?.message || "Failed to delete expense");
      fetchAllExpenses().catch(() => { });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" onClick={handleClickOutside}>
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Summary</h1>
              <p className="text-sm text-gray-600 mt-1">View and manage all your expenses</p>
              {pageError && <div className="mt-2 text-xs text-red-600">{pageError}</div>}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">{periodLabel} Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {allExpensesLoading ? "Loading..." : fmtMoney(selectedPeriodTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-3">
              {(searchQuery || selectedCategory !== "All" || dateSort !== "desc" || amountSort !== null) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, notes, or category..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sort by Date</label>
                <button
                  onClick={toggleDateSort}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {dateSort === "desc" ? "Newest First" : "Oldest First"}
                  {dateSort === "desc" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sort by Amount</label>
                <button
                  onClick={toggleAmountSort}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {amountSort === "desc" ? "High to Low" : amountSort === "asc" ? "Low to High" : "Default"}
                  {amountSort === "desc" ? <ChevronDown size={16} /> : amountSort === "asc" ? <ChevronUp size={16} /> : null}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Expenses</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {allExpensesLoading ? "Loading..." : `Showing ${filteredExpenses.length} of ${list.length} expenses`}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Sorted by: {dateSort === "desc" ? "Newest First" : "Oldest First"}
                {amountSort && ` • ${amountSort === "desc" ? "High to Low" : "Low to High"}`}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {allExpensesLoading ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">Loading expenses…</div>
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <div key={expense._id} className="px-6 py-4 hover:bg-gray-50 transition-colors relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-medium text-sm"
                          style={{ backgroundColor: CATEGORY_COLORS[expense.category] || "#6B7280" }}
                          title={expense.category}
                        >
                          {(expense.category || "Other").charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 truncate">{expense.title}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar size={14} />
                                  <span>{formatDate(expense.date)}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-gray-900 ml-2">{fmtMoney(expense.amount)}</span>
                          </div>
                        </div>
                      </div>

                      {expense.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">{expense.notes}</p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[expense.category] || "#6B7280"}20`,
                              color: CATEGORY_COLORS[expense.category] || "#6B7280",
                            }}
                          >
                            {expense.category || "Other"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative menu-container ml-4">
                      <button
                        onClick={() => toggleMenu(expense._id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="More options"
                        disabled={deletingId === expense._id}
                      >
                        <MoreVertical size={20} className="text-gray-500" />
                      </button>

                      {activeMenu === expense._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
                          <button
                            onClick={() => handleEditExpense(expense._id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit size={16} className="text-gray-500" />
                            Edit Expense
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                            disabled={deletingId === expense._id}
                          >
                            <Trash2 size={16} />
                            {deletingId === expense._id ? "Deleting..." : "Delete Expense"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 mb-2">No expenses found</p>
                <p className="text-sm text-gray-400">
                  {searchQuery || selectedCategory !== "All" ? "Try changing your filters or search terms" : "No expenses recorded yet"}
                </p>
              </div>
            )}
          </div>
          <EditExpenseModal
            open={editOpen}
            expense={editExpense}
            onClose={closeEdit}
            onSaved={onEditSaved}
          />

        </div>
      </main>
    </div>
  );
}
