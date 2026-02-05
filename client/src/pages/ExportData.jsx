// src/pages/ExportData.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  Mail,
  Cloud,
  CheckCircle,
  FileSpreadsheet,
  FileJson,
  File,
  Copy,
  FileCode,
  AlertCircle,
} from "lucide-react";
import { useGlobal } from "../context/GlobalContext";

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

// Fallback only (if you don't have categories in DB yet)
const FALLBACK_CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Other"];

function fmtMoney(n) {
  const num = Number(n || 0);
  return `৳${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toYYYYMMDD(start), to: toYYYYMMDD(end) };
}

function getLastMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const end = new Date(date.getFullYear(), date.getMonth(), 0);
  return { from: toYYYYMMDD(start), to: toYYYYMMDD(end) };
}

function getYearRange(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31);
  return { from: toYYYYMMDD(start), to: toYYYYMMDD(end) };
}

function buildFilename(ext) {
  return `expenses-export-${new Date().toISOString().slice(0, 10)}.${ext}`;
}

function escapeCsvCell(v) {
  const s = String(v ?? "");
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export default function ExportData() {
  // ✅ expects your GlobalContext to provide these.
  // If you already have categories in global context, map them here.
  const {
    token,
    allExpenses,
    allExpensesLoading,
    allExpensesError,
    fetchAllExpenses,
    categories: dbCategories, // optional: from settings/categories API (array of {name,color} or array of strings)
  } = useGlobal();

  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedRange, setSelectedRange] = useState("month");
  const [includeNotes, setIncludeNotes] = useState(true);

  // Only for custom UI
  const [startDate, setStartDate] = useState(() => getMonthRange(new Date()).from);
  const [endDate, setEndDate] = useState(() => getMonthRange(new Date()).to);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pageError, setPageError] = useState("");

  // ✅ Build category list dynamically:
  // - If dbCategories exists: support [{name,color}] or ["Food",...]
  // - Else infer from expenses
  // - Else fallback list
  const allCategoryNames = useMemo(() => {
    const set = new Set();

    if (Array.isArray(dbCategories) && dbCategories.length) {
      for (const c of dbCategories) {
        const name = typeof c === "string" ? c : c?.name;
        if (name) set.add(String(name));
      }
    }

    // If no categories in settings, infer from all expenses
    if (set.size === 0 && Array.isArray(allExpenses) && allExpenses.length) {
      for (const e of allExpenses) set.add(e?.category || "Other");
    }

    // Fallback
    if (set.size === 0) {
      for (const c of FALLBACK_CATEGORIES) set.add(c);
    }

    // Always keep Other visible
    set.add("Other");

    return Array.from(set)
      .map((s) => String(s))
      .sort((a, b) => a.localeCompare(b));
  }, [dbCategories, allExpenses]);

  // Categories selection includes "All" + all current categories
  const CATEGORIES = useMemo(() => ["All", ...allCategoryNames], [allCategoryNames]);

  const [selectedCategories, setSelectedCategories] = useState(["All"]);

  // Keep selection valid when categories change
  useEffect(() => {
    setSelectedCategories((prev) => {
      // if "All", keep it
      if (prev.includes("All")) return ["All"];
      const valid = prev.filter((c) => allCategoryNames.includes(c));
      return valid.length ? valid : ["All"];
    });
  }, [allCategoryNames]);

  // Load expenses once
  useEffect(() => {
    if (!token) return;
    fetchAllExpenses().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setPageError(allExpensesError || "");
  }, [allExpensesError]);

  // ✅ derive active range from selectedRange (always correct)
  const activeRange = useMemo(() => {
    const now = new Date();
    if (selectedRange === "month") return getMonthRange(now);
    if (selectedRange === "last-month") return getLastMonthRange(now);
    if (selectedRange === "year") return getYearRange(now);
    if (selectedRange === "custom") return { from: startDate || "", to: endDate || "" };
    return { from: "", to: "" }; // all
  }, [selectedRange, startDate, endDate]);

  // ✅ when range changes, auto-fill inputs for convenience
  useEffect(() => {
    const now = new Date();

    if (selectedRange === "month") {
      const r = getMonthRange(now);
      setStartDate(r.from);
      setEndDate(r.to);
    } else if (selectedRange === "last-month") {
      const r = getLastMonthRange(now);
      setStartDate(r.from);
      setEndDate(r.to);
    } else if (selectedRange === "year") {
      const r = getYearRange(now);
      setStartDate(r.from);
      setEndDate(r.to);
    } else if (selectedRange === "all") {
      setStartDate("");
      setEndDate("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange]);

  const list = useMemo(() => (Array.isArray(allExpenses) ? allExpenses : []), [allExpenses]);

  const customRangeInvalid =
    selectedRange === "custom" && activeRange.from && activeRange.to && activeRange.from > activeRange.to;

  const filteredExpenses = useMemo(() => {
    let filtered = [...list];

    // ✅ Date filter
    const from = activeRange.from;
    const to = activeRange.to;

    if (selectedRange !== "all") {
      if (from && to) filtered = filtered.filter((e) => e.date >= from && e.date <= to);
      else if (from) filtered = filtered.filter((e) => e.date >= from);
      else if (to) filtered = filtered.filter((e) => e.date <= to);
    }

    // Category filter
    if (!selectedCategories.includes("All")) {
      filtered = filtered.filter((e) => selectedCategories.includes(e.category || "Other"));
    }

    // sort newest first
    filtered.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return filtered;
  }, [list, selectedRange, selectedCategories, activeRange.from, activeRange.to]);

  // ✅ Export summary card: show the SELECTED date range correctly (not oldest/newest)
  const selectedDateRangeLabel = useMemo(() => {
    if (selectedRange === "all") return "All time";

    const from = activeRange.from;
    const to = activeRange.to;

    if (selectedRange === "custom") {
      if (!from && !to) return "Custom: not set";
      if (from && to) return `${formatDate(from)} - ${formatDate(to)}`;
      if (from) return `From ${formatDate(from)}`;
      if (to) return `Up to ${formatDate(to)}`;
      return "Custom";
    }

    // month/last-month/year => always have from/to
    if (from && to) return `${formatDate(from)} - ${formatDate(to)}`;
    return TIME_RANGES.find((r) => r.id === selectedRange)?.name || "Selected range";
  }, [selectedRange, activeRange.from, activeRange.to]);

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const avg = filteredExpenses.length ? total / filteredExpenses.length : 0;
    const uniqueCats = new Set(filteredExpenses.map((e) => e.category || "Other"));

    return {
      total,
      average: avg,
      count: filteredExpenses.length,
      categories: uniqueCats.size,
      dateRange: selectedDateRangeLabel, // ✅ FIXED
    };
  }, [filteredExpenses, selectedDateRangeLabel]);

  const toggleCategory = (category) => {
    if (category === "All") {
      setSelectedCategories(["All"]);
      return;
    }

    setSelectedCategories((prev) => {
      const base = prev.includes("All") ? [] : [...prev];
      const exists = base.includes(category);
      const next = exists ? base.filter((c) => c !== category) : [...base, category];
      return next.length ? next : ["All"];
    });
  };

  const generateCSV = () => {
    const headers = ["Date", "Title", "Amount", "Category", ...(includeNotes ? ["Notes"] : [])];
    const rows = filteredExpenses.map((e) => [
      e.date || "",
      e.title || "",
      Number(e.amount || 0),
      e.category || "Other",
      ...(includeNotes ? [e.notes || ""] : []),
    ]);

    return [headers.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))].join("\n");
  };

  const generateJSON = () => {
    const data = filteredExpenses.map((e) => {
      const item = {
        _id: e._id,
        title: e.title || "",
        amount: Number(e.amount || 0),
        category: e.category || "Other",
        date: e.date || "",
      };
      if (includeNotes) item.notes = e.notes || "";
      return item;
    });
    return JSON.stringify(data, null, 2);
  };

  const downloadTextFile = (content, mimeType, extension) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename(extension);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    setPageError("");

    try {
      if (!filteredExpenses.length) throw new Error("No expenses to export.");
      if (customRangeInvalid) throw new Error("Start date cannot be after end date.");

      if (selectedFormat === "csv") {
        downloadTextFile(generateCSV(), "text/csv;charset=utf-8", "csv");
      } else if (selectedFormat === "json") {
        downloadTextFile(generateJSON(), "application/json;charset=utf-8", "json");
      } else if (selectedFormat === "pdf") {
        const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Expenses Export</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Arial; padding:24px;}
    h1{margin:0 0 8px;}
    .meta{color:#555; margin-bottom:16px;}
    table{border-collapse:collapse; width:100%;}
    th,td{border:1px solid #ddd; padding:8px; font-size:12px;}
    th{background:#f5f5f5; text-align:left;}
  </style>
</head>
<body>
  <h1>Expenses Export</h1>
  <div class="meta">Rows: ${filteredExpenses.length} • Total: ${fmtMoney(stats.total)} • Range: ${stats.dateRange}</div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Title</th><th>Amount</th><th>Category</th>${includeNotes ? "<th>Notes</th>" : ""}
      </tr>
    </thead>
    <tbody>
      ${filteredExpenses
        .map(
          (e) => `<tr>
<td>${e.date || ""}</td>
<td>${(e.title || "").replace(/</g, "&lt;")}</td>
<td>${Number(e.amount || 0).toFixed(2)}</td>
<td>${(e.category || "Other").replace(/</g, "&lt;")}</td>
${includeNotes ? `<td>${(e.notes || "").replace(/</g, "&lt;")}</td>` : ""}
</tr>`
        )
        .join("")}
    </tbody>
  </table>
  <p style="color:#666; margin-top:16px;">Tip: Open this file in browser and press Ctrl+P → “Save as PDF”.</p>
</body>
</html>`;
        downloadTextFile(html, "text/html;charset=utf-8", "html");
      } else if (selectedFormat === "excel") {
        downloadTextFile(generateCSV(), "text/csv;charset=utf-8", "csv");
      } else {
        downloadTextFile(generateCSV(), "text/csv;charset=utf-8", "csv");
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (e) {
      setPageError(e?.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const content = selectedFormat === "csv" ? generateCSV() : generateJSON();
      await navigator.clipboard.writeText(content);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 1500);
    } catch {
      setPageError("Clipboard permission denied. Please copy manually.");
    }
  };

  const timeRangeName = TIME_RANGES.find((r) => r.id === selectedRange)?.name || "All Time";
  const formatName = EXPORT_FORMATS.find((f) => f.id === selectedFormat)?.name || "CSV";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
              <p className="text-sm text-gray-600 mt-1">Export your expense data in multiple formats</p>
              {pageError && (
                <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {pageError}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {exportSuccess && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                  <CheckCircle size={16} />
                  Done
                </div>
              )}
              <button
                onClick={() => setShowPreview((p) => !p)}
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
          {/* Left: settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Format */}
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
                      <div className={`p-2 rounded-lg ${selectedFormat === format.id ? "bg-blue-100" : "bg-gray-100"}`}>
                        <div className={selectedFormat === format.id ? "text-blue-600" : "text-gray-600"}>{format.icon}</div>
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

              {selectedFormat === "pdf" && (
                <div className="mt-4 text-xs text-gray-500">
                  PDF: downloads an HTML report (open → Ctrl+P → Save as PDF). For true PDF, add backend generation or a PDF library.
                </div>
              )}
              {selectedFormat === "excel" && (
                <div className="mt-4 text-xs text-gray-500">
                  Excel: downloads CSV (Excel opens it). For true .xlsx, add SheetJS (xlsx).
                </div>
              )}
            </div>

            {/* Time range */}
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

                  {customRangeInvalid && (
                    <div className="mt-3 text-xs text-red-600 flex items-center gap-2">
                      <AlertCircle size={14} />
                      Start date cannot be after end date.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category filter (✅ show all current categories here) */}
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
                    {selectedCategories.includes(category) && <CheckCircle size={14} className="inline ml-2" />}
                  </button>
                ))}
              </div>

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

          {/* Right: summary + actions */}
          <div className="space-y-8">
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
                  <span className="text-gray-600">Categories (in result)</span>
                  <span className="font-semibold text-gray-900">{stats.categories}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Selected Date Range</span>
                  <span className="font-semibold text-gray-900 text-right">{stats.dateRange}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FileText size={16} />
                  <span>
                    Export Format: <span className="font-semibold text-gray-900">{formatName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>
                    Time Range: <span className="font-semibold text-gray-900">{timeRangeName}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Export Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting || allExpensesLoading || filteredExpenses.length === 0 || customRangeInvalid}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isExporting || allExpensesLoading || filteredExpenses.length === 0 || customRangeInvalid
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
                      Download {selectedFormat.toUpperCase()}
                    </>
                  )}
                </button>

                <button
                  onClick={copyToClipboard}
                  disabled={allExpensesLoading || filteredExpenses.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy size={20} />
                  Copy to Clipboard
                </button>

                <button
                  type="button"
                  onClick={() => alert("Later: implement email export")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail size={20} />
                  Email Export
                </button>

                <button
                  type="button"
                  onClick={() => alert("Later: implement cloud save")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Cloud size={20} />
                  Save to Cloud
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Tip:</span> For “Excel”, open the CSV in Excel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Data Preview</h2>
                  <p className="text-sm text-gray-500 mt-1">Preview of {filteredExpenses.length} expenses (first 10 shown)</p>
                </div>
                <div className="text-sm text-gray-600">Format: {selectedFormat.toUpperCase()}</div>
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
                  {filteredExpenses.slice(0, 10).map((e) => (
                    <tr key={e._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{e.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{fmtMoney(e.amount)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {e.category || "Other"}
                        </span>
                      </td>
                      {includeNotes && <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{e.notes}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!allExpensesLoading && filteredExpenses.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 mb-2">No data to preview</p>
                <p className="text-sm text-gray-400">Adjust your filters to see expenses</p>
              </div>
            )}

            {allExpensesLoading && <div className="px-6 py-12 text-center text-sm text-gray-500">Loading expenses…</div>}
          </div>
        )}
      </main>
    </div>
  );
}
