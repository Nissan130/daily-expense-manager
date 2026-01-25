// src/pages/Summary.jsx
import { useState, useMemo } from "react";
import { Calendar, Filter, ChevronDown, ChevronUp, Download, Search, MoreVertical, Edit, Trash2 } from "lucide-react";

// Mock data - in real app, this would come from props or context
const DUMMY_EXPENSES = [
  { _id: "1", title: "Lunch", amount: 120, category: "Food", date: "2026-01-25", notes: "Rice + chicken" },
  { _id: "2", title: "Bus Fare", amount: 40, category: "Transport", date: "2026-01-25", notes: "" },
  { _id: "3", title: "Internet Bill", amount: 1200, category: "Bills", date: "2026-01-24", notes: "Monthly" },
  { _id: "4", title: "Groceries", amount: 560, category: "Shopping", date: "2026-01-21", notes: "Vegetables & fruits" },
  { _id: "5", title: "Medicine", amount: 220, category: "Health", date: "2026-01-20", notes: "" },
  { _id: "6", title: "Snacks", amount: 80, category: "Food", date: "2026-01-19", notes: "" },
  { _id: "7", title: "Movie Ticket", amount: 300, category: "Entertainment", date: "2026-01-18", notes: "Weekend movie" },
  { _id: "8", title: "Electricity Bill", amount: 850, category: "Bills", date: "2026-01-15", notes: "Monthly payment" },
  { _id: "9", title: "Fuel", amount: 1500, category: "Transport", date: "2026-01-12", notes: "Car fuel" },
  { _id: "10", title: "Dinner", amount: 250, category: "Food", date: "2026-01-10", notes: "Restaurant" },
];

const CATEGORIES = ["All", "Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Other"];
const CATEGORY_COLORS = {
  Food: "#10B981",
  Transport: "#3B82F6",
  Bills: "#8B5CF6",
  Shopping: "#F59E0B",
  Health: "#EF4444",
  Entertainment: "#EC4899",
  Other: "#6B7280"
};

function fmtMoney(n) {
  const num = Number(n || 0);
  return `৳${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function getDayOfWeek(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export default function Summary() {
  const [expenses, setExpenses] = useState(DUMMY_EXPENSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateSort, setDateSort] = useState("desc"); // 'desc' for newest first, 'asc' for oldest first
  const [amountSort, setAmountSort] = useState(null); // null, 'desc', 'asc'
  const [activeMenu, setActiveMenu] = useState(null); // Track which item's menu is open

  // Calculate totals
  const totalAmount = useMemo(() => 
    expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), 
    [expenses]
  );

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.title.toLowerCase().includes(query) ||
        expense.notes.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (dateSort === 'desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (dateSort === 'asc') {
        return new Date(a.date) - new Date(b.date);
      }
      return 0;
    });

    if (amountSort === 'desc') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (amountSort === 'asc') {
      filtered.sort((a, b) => a.amount - b.amount);
    }

    return filtered;
  }, [expenses, searchQuery, selectedCategory, dateSort, amountSort]);

  // Handle date sort toggle
  const toggleDateSort = () => {
    setDateSort(dateSort === 'desc' ? 'asc' : 'desc');
    setAmountSort(null);
  };

  // Handle amount sort toggle
  const toggleAmountSort = () => {
    if (amountSort === null) {
      setAmountSort('desc');
    } else if (amountSort === 'desc') {
      setAmountSort('asc');
    } else {
      setAmountSort(null);
    }
    setDateSort('desc');
  };

  // Export data function
  const exportData = () => {
    const dataStr = JSON.stringify(filteredExpenses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-summary-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setDateSort("desc");
    setAmountSort(null);
  };

  // Handle edit expense
  const handleEditExpense = (id) => {
    console.log("Edit expense:", id);
    setActiveMenu(null); // Close menu
    // In a real app, you would open an edit modal or navigate to edit page
  };

  // Handle delete expense
  const handleDeleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter(expense => expense._id !== id));
      setActiveMenu(null); // Close menu
    }
  };

  // Toggle menu for a specific item
  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  // Close menu when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.menu-container')) {
      setActiveMenu(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" onClick={handleClickOutside}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Summary</h1>
              <p className="text-sm text-gray-600 mt-1">View and manage all your expenses</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-gray-900">{fmtMoney(totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
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
            {/* Search Input */}
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

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sort by Date</label>
                <button
                  onClick={toggleDateSort}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {dateSort === 'desc' ? 'Newest First' : 'Oldest First'}
                  {dateSort === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sort by Amount</label>
                <button
                  onClick={toggleAmountSort}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {amountSort === 'desc' ? 'High to Low' : amountSort === 'asc' ? 'Low to High' : 'Default'}
                  {amountSort === 'desc' ? <ChevronDown size={16} /> : amountSort === 'asc' ? <ChevronUp size={16} /> : null}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expense List - Full Width */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Expenses</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredExpenses.length} of {expenses.length} expenses
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Sorted by: {dateSort === 'desc' ? 'Newest First' : 'Oldest First'}
                {amountSort && ` • ${amountSort === 'desc' ? 'High to Low' : 'Low to High'}`}
              </div>
            </div>
          </div>

          {/* Expense List */}
          <div className="divide-y divide-gray-200">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <div key={expense._id} className="px-6 py-4 hover:bg-gray-50 transition-colors relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-medium text-sm"
                          style={{ backgroundColor: CATEGORY_COLORS[expense.category] || "#6B7280" }}
                        >
                          {expense.category.charAt(0)}
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
                                {/* <span className="text-sm text-gray-500">•</span> */}
                                {/* <span className="text-sm text-gray-500">{getDayOfWeek(expense.date)}</span> */}
                              </div>
                            </div>
                            <span className="text-lg font-bold text-gray-900 ml-2">{fmtMoney(expense.amount)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {expense.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">
                          {expense.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span 
                            className="px-3 py-1 text-xs font-medium rounded-full"
                            style={{ 
                              backgroundColor: `${CATEGORY_COLORS[expense.category] || "#6B7280"}20`,
                              color: CATEGORY_COLORS[expense.category] || "#6B7280"
                            }}
                          >
                            {expense.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Three-dot menu button */}
                    <div className="relative menu-container ml-4">
                      <button
                        onClick={() => toggleMenu(expense._id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="More options"
                      >
                        <MoreVertical size={20} className="text-gray-500" />
                      </button>

                      {/* Dropdown menu */}
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
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            Delete Expense
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
                  {searchQuery || selectedCategory !== "All" 
                    ? "Try changing your filters or search terms" 
                    : "No expenses recorded yet"}
                </p>
              </div>
            )}
          </div>
        </div>

        
      </main>
    </div>
  );
}