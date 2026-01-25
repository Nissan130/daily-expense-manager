// src/components/Sidebar.jsx
import { useMemo, useState } from "react";

export default function Sidebar({ active = "Dashboard", onSelect }) {
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [
      { key: "Dashboard", label: "Dashboard" },
      { key: "Summary", label: "Summary" },
      { key: "Stats", label: "Stats" },
      { key: "IncomeManager", label: "Income Manager" },
      { key: "Export", label: "Export options" },
    ],
    []
  );

  const NavItems = ({ compact = false }) => (
    <div className={compact ? "space-y-1" : "mt-3 space-y-1"}>
      {items.map((item) => {
        const isActive = active === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              onSelect?.(item.key);
              setOpen(false);
            }}
            className={[
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition",
              isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            <span className="font-medium">{item.label}</span>
            {isActive && (
              <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold">
              DE
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-gray-900">Daily Expense</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 h-screen sticky top-0 bg-white border-r border-gray-200">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold">
              DE
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-gray-900">Daily Expense</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Menu
          </p>
          <NavItems />

          {/* Quick tip */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Quick tip</p>
            <p className="text-xs text-gray-600 mt-1">
              Add expenses daily to keep your stats accurate.
            </p>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-semibold text-gray-900">You</p>
              <p className="text-xs text-gray-500">Personal Mode</p>
            </div>
            <button
              type="button"
              className="text-sm rounded-xl border border-gray-300 px-3 py-2 hover:bg-gray-50 transition"
            >
              Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close menu backdrop"
            type="button"
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl border-r border-gray-200">
            {/* Drawer header */}
            <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold">
                  DE
                </div>
                <div className="leading-tight">
                  <p className="font-semibold text-gray-900">Daily Expense</p>
                  <p className="text-xs text-gray-500">Manager</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            {/* Drawer body */}
            <div className="p-4">
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase px-1">
                Menu
              </p>
              <NavItems compact />

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Quick tip</p>
                <p className="text-xs text-gray-600 mt-1">
                  Add expenses daily to keep your stats accurate.
                </p>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">You</p>
                  <p className="text-xs text-gray-500">Personal Mode</p>
                </div>
                <button
                  type="button"
                  className="text-sm rounded-xl border border-gray-300 px-3 py-2 hover:bg-gray-50 transition"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
