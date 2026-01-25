// src/pages/ExportData.jsx
import { useState, useMemo } from "react";
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  Mail, 
  Cloud, 
  CheckCircle, 
  ChevronDown, 
  FileSpreadsheet, 
  FileJson, 
  File, 
  Copy,
  FileCode,
  FileDigit
} from "lucide-react";

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
  { _id: "11", title: "Coffee", amount: 180, category: "Food", date: "2026-01-08", notes: "Starbucks" },
  { _id: "12", title: "Gym", amount: 800, category: "Health", date: "2026-01-05", notes: "Monthly membership" },
];

const EXPORT_FORMATS = [
  { id: "csv", name: "CSV", icon: <FileCode size={20} />, description: "Comma-separated values (Excel compatible)" },
  { id: "json", name: "JSON", icon: <FileJson size={20} />, description: "JavaScript Object Notation (API format)" },
  { id: "pdf", name: "PDF", icon: <File size={20} />, description: "Portable Document Format (Print ready)" },
  { id: "excel", name: "Excel", icon: <FileSpreadsheet size={20} />, description: "Microsoft Excel format (.xlsx)" },
];

const TIME_RANGES = [
  { id: "all", name: "All Time", description: "Export all recorded expenses" },
  { id: "month", name: "This Month", description: "Expenses from current month" },
  { id: "last-month", name: "Last Month", description: "Expenses from previous month" },
  { id: "year", name: "This Year", description: "Expenses from current year" },
  { id: "custom", name: "Custom Range", description: "Select specific date range" },
];

const CATEGORIES = ["All", "Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Other"];

function fmtMoney(n) {
  const num = Number(n || 0);
  return `৳${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export default function ExportData() {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedRange, setSelectedRange] = useState("month");
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-31");
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Filter expenses based on selected options
  const filteredExpenses = useMemo(() => {
    let filtered = [...DUMMY_EXPENSES];

    // Filter by date range
    if (selectedRange === "month") {
      filtered = filtered.filter(expense => 
        expense.date.startsWith("2026-01") // Current month
      );
    } else if (selectedRange === "last-month") {
      filtered = filtered.filter(expense => 
        expense.date.startsWith("2025-12") // Last month
      );
    } else if (selectedRange === "year") {
      filtered = filtered.filter(expense => 
        expense.date.startsWith("2026") // Current year
      );
    } else if (selectedRange === "custom") {
      filtered = filtered.filter(expense => 
        expense.date >= startDate && expense.date <= endDate
      );
    }

    // Filter by categories
    if (!selectedCategories.includes("All")) {
      filtered = filtered.filter(expense => 
        selectedCategories.includes(expense.category)
      );
    }

    return filtered;
  }, [selectedRange, selectedCategories, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avg = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;
    const categories = [...new Set(filteredExpenses.map(e => e.category))];
    
    return {
      total,
      average: avg,
      count: filteredExpenses.length,
      categories: categories.length,
      dateRange: filteredExpenses.length > 0 
        ? `${formatDate(filteredExpenses[filteredExpenses.length - 1].date)} - ${formatDate(filteredExpenses[0].date)}`
        : "No data"
    };
  }, [filteredExpenses]);

  // Toggle category selection
  const toggleCategory = (category) => {
    if (category === "All") {
      setSelectedCategories(["All"]);
    } else {
      const newCategories = selectedCategories.includes("All") 
        ? [category]
        : selectedCategories.includes(category)
          ? selectedCategories.filter(c => c !== category)
          : [...selectedCategories, category];
      
      setSelectedCategories(newCategories.length > 0 ? newCategories : ["All"]);
    }
  };

  // Generate CSV content
  const generateCSV = () => {
    const headers = ["Date", "Title", "Amount", "Category", ...(includeNotes ? ["Notes"] : [])];
    const rows = filteredExpenses.map(expense => [
      expense.date,
      expense.title,
      expense.amount,
      expense.category,
      ...(includeNotes ? [expense.notes] : [])
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    return csvContent;
  };

  // Generate JSON content
  const generateJSON = () => {
    return JSON.stringify(filteredExpenses.map(expense => ({
      ...expense,
      ...(includeNotes ? {} : { notes: undefined })
    })).filter(expense => includeNotes || expense.notes !== undefined), null, 2);
  };

  // Export data function
  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    // Simulate export process
    setTimeout(() => {
      let content, mimeType, extension;
      
      switch (selectedFormat) {
        case "csv":
          content = generateCSV();
          mimeType = "text/csv";
          extension = "csv";
          break;
        case "json":
          content = generateJSON();
          mimeType = "application/json";
          extension = "json";
          break;
        case "pdf":
          // In a real app, you would generate PDF here
          content = "PDF content would be generated here";
          mimeType = "application/pdf";
          extension = "pdf";
          break;
        case "excel":
          // In a real app, you would generate Excel file
          content = "Excel content would be generated here";
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          extension = "xlsx";
          break;
        default:
          content = generateCSV();
          mimeType = "text/csv";
          extension = "csv";
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-export-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  // Copy data to clipboard
  const copyToClipboard = () => {
    const content = selectedFormat === "csv" ? generateCSV() : generateJSON();
    navigator.clipboard.writeText(content).then(() => {
      alert("Data copied to clipboard!");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
              <p className="text-sm text-gray-600 mt-1">Export your expense data in multiple formats</p>
            </div>
            
            <div className="flex items-center gap-3">
              {exportSuccess && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                  <CheckCircle size={16} />
                  Export successful!
                </div>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileText size={16} />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Export Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Format Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Export Format</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose your preferred file format</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPORT_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedFormat === format.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        selectedFormat === format.id ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        <div className={selectedFormat === format.id ? "text-blue-600" : "text-gray-600"}>
                          {format.icon}
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">{format.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{format.description}</p>
                    {selectedFormat === format.id && (
                      <div className="mt-3 flex items-center gap-1 text-blue-600 text-sm">
                        <CheckCircle size={14} />
                        <span>Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Range Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Time Range</h2>
                  <p className="text-sm text-gray-500 mt-1">Select which data to export</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setSelectedRange(range.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedRange === range.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{range.name}</div>
                    <p className="text-sm text-gray-600">{range.description}</p>
                  </button>
                ))}
              </div>

              {/* Custom Date Range */}
              {selectedRange === "custom" && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Custom Date Range</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Filter className="text-green-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                  <p className="text-sm text-gray-500 mt-1">Select categories to include</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {category}
                    {selectedCategories.includes(category) && (
                      <CheckCircle size={14} className="inline ml-2" />
                    )}
                  </button>
                ))}
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Include Notes</p>
                    <p className="text-sm text-gray-600">Export expense notes column</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Export */}
          <div className="space-y-8">
            {/* Statistics Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Export Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-gray-900">{stats.count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-gray-900">{fmtMoney(stats.total)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Expense</span>
                  <span className="font-semibold text-gray-900">{fmtMoney(stats.average)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold text-gray-900">{stats.categories}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date Range</span>
                  <span className="font-semibold text-gray-900 text-right">{stats.dateRange}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <FileText size={16} />
                  <span>Export Format: <span className="font-semibold text-gray-900">
                    {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.name}
                  </span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Time Range: <span className="font-semibold text-gray-900">
                    {TIME_RANGES.find(r => r.id === selectedRange)?.name}
                  </span></span>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Export Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting || filteredExpenses.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isExporting || filteredExpenses.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Download {selectedFormat.toUpperCase()} File
                    </>
                  )}
                </button>

                <button
                  onClick={copyToClipboard}
                  disabled={filteredExpenses.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy size={20} />
                  Copy to Clipboard
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                  <Mail size={20} />
                  Email Export
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                  <Cloud size={20} />
                  Save to Cloud
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Note:</span> Your data will be exported in the selected format. 
                  For large datasets, the export may take a few moments.
                </p>
              </div>
            </div>

            {/* Recent Exports */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Exports</h2>
              
              <div className="space-y-3">
                {[
                  { name: "expenses-jan-2026.csv", date: "2026-01-25", size: "24 KB" },
                  { name: "expenses-dec-2025.json", date: "2025-12-31", size: "18 KB" },
                  { name: "full-year-report.pdf", date: "2025-12-31", size: "1.2 MB" },
                ].map((exportItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <FileText size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{exportItem.name}</p>
                        <p className="text-xs text-gray-500">{exportItem.date} • {exportItem.size}</p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded-lg">
                      <Download size={16} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        {showPreview && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Data Preview</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Preview of {filteredExpenses.length} expenses (first 10 shown)
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Format: {selectedFormat.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    {includeNotes && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.slice(0, 10).map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{expense.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{fmtMoney(expense.amount)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {expense.category}
                        </span>
                      </td>
                      {includeNotes && (
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{expense.notes}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredExpenses.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 mb-2">No data to preview</p>
                <p className="text-sm text-gray-400">Adjust your filters to see expenses</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}