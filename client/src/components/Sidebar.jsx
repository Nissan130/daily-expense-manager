// src/components/Sidebar.jsx
import { useMemo, useState, useEffect } from "react";
import { 
  Home, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  User,
  LogOut
} from "lucide-react";

export default function Sidebar({ active = "Dashboard", onSelect }) {
  const [open, setOpen] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const items = useMemo(
    () => [
      { key: "Dashboard", label: "Dashboard", icon: <Home size={20} /> },
      { key: "Summary", label: "Summary", icon: <PieChart size={20} /> },
      // { key: "IncomeManager", label: "Income Manager", icon: <TrendingUp size={20} /> },
      { key: "Export", label: "Export Data", icon: <Download size={20} /> },
      { key: "Settings", label: "Settings", icon: <Settings size={20} /> },
    ],
    []
  );

  // Check if sidebar needs scrolling based on window height
  useEffect(() => {
    const checkScrollability = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const sidebarHeight = sidebar.scrollHeight;
        const windowHeight = window.innerHeight;
        // If sidebar content height is greater than 90% of window height, enable scrolling
        setIsScrollable(sidebarHeight > windowHeight * 0.9);
      }
    };

    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  // In src/components/Sidebar.jsx
const handleLogout = () => {
  if (window.confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "/signin";
  }
};

  const NavItems = ({ compact = false }) => (
    <div className={compact ? "space-y-2" : "mt-4 space-y-2"}>
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
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 group",
              isActive 
                ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm",
            ].join(" ")}
          >
            <div className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}>
              {item.icon}
            </div>
            <span className="font-medium flex-1 text-left">{item.label}</span>
            {isActive && (
              <ChevronRight size={16} className="text-white/80" />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center font-bold shadow-md">
              <span className="text-lg">DE</span>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-gray-900">Daily Expense</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className={`
        hidden md:flex md:flex-col w-64 h-screen sticky top-0 
        bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-sm
        ${isScrollable ? 'overflow-y-auto' : 'overflow-hidden'}
      `}>
        {/* Brand */}
        <div className="px-5 py-6 border-b border-gray-200/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center font-bold shadow-lg">
              <span className="text-xl">DE</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Daily Expense</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div className="px-5 py-4 border-b border-gray-200/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">John Doe</p>
            </div>
          </div>
        </div>

        {/* Nav - Scrollable area */}
        <nav className={`
          flex-1 px-3 py-6 
          ${isScrollable ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}
        `}>
          <p className="px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 shrink-0">
            Navigation
          </p>
          <NavItems />
        </nav>

        {/* Footer with only Logout */}
        <div className="mt-auto px-5 py-4 border-t border-gray-200/50 shrink-0">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <LogOut size={16} className="text-red-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">Logout</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400 group-hover:text-red-200" />
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer with scrollable content */}
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 flex flex-col">
            {/* Drawer header */}
            <div className="px-5 py-4 border-b border-gray-200/50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center font-bold">
                    <span className="text-lg">DE</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Daily Expense</p>
                    <p className="text-xs text-gray-500">Manager</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* User profile */}
            <div className="px-5 py-4 border-b border-gray-200/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">John Doe</p>
                </div>
              </div>
            </div>

            {/* Drawer body - Scrollable area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase px-1 mb-3">
                Navigation
              </p>
              <NavItems compact />
            </div>

            {/* Drawer footer with only Logout */}
            <div className="shrink-0 p-4 border-t border-gray-200/50 bg-white/95">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                type="button"
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <LogOut size={16} className="text-red-600 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Logout</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-red-400 group-hover:text-red-200" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
      `}</style>
    </>
  );
}