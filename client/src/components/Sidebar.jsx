// src/components/Sidebar.jsx
import { useMemo, useState, useEffect } from "react";
import {
  Home,
  PieChart,
  Download,
  Settings,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut
} from "lucide-react";
import { useGlobal } from "../context/GlobalContext";


export default function Sidebar({ active = "Dashboard", onSelect }) {
  const { user, userLoading, logout, fetchMe, isAuthenticated } = useGlobal();

  const [open, setOpen] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);

 useEffect(() => {
    if (isAuthenticated) fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);



  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide text and show only icons on medium screens (768px - 1024px)
  const isCompact = windowWidth >= 768 && windowWidth < 1024;
  const sidebarWidth = isCompact ? 'w-20' : 'w-64';

  const items = useMemo(
    () => [
      { key: "Dashboard", label: "Dashboard", icon: <Home size={20} /> },
      { key: "History", label: "History", icon: <PieChart size={20} /> },
      { key: "Export", label: "Export Data", icon: <Download size={20} /> },
      // { key: "Settings", label: "Settings", icon: <Settings size={20} /> },
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
        setIsScrollable(sidebarHeight > windowHeight * 0.9);
      }
    };

    checkScrollability();
    window.addEventListener('resize', checkScrollability);

    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      window.location.href = "/signin";
    }
  };


  const NavItems = ({ compact = false, isMobile = false }) => (
    <div className={compact || isMobile ? "space-y-2" : "mt-4 space-y-2"}>
      {items.map((item) => {
        const isActive = active === item.key;
        const isHovered = hoveredItem === item.key && !isMobile;

        return (
          <div key={item.key} className="relative">
            <button
              type="button"
              onClick={() => {
                onSelect?.(item.key);
                setOpen(false);
              }}
              onMouseEnter={() => setHoveredItem(item.key)}
              onMouseLeave={() => setHoveredItem(null)}
              className={[
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm",
                compact && !isMobile ? "justify-center px-3" : ""
              ].join(" ")}
            >
              <div className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}>
                {item.icon}
              </div>
              {(!compact || isMobile) && (
                <>
                  <span className="font-medium flex-1 text-left truncate">{item.label}</span>
                  {isActive && (
                    <ChevronRight size={16} className="text-white/80" />
                  )}
                </>
              )}
            </button>

            {/* Hover popup for compact mode */}
            {compact && !isMobile && isHovered && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-in slide-in-from-left-1 duration-200">
                  {item.label}
                  {/* Triangle pointer */}
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
      <aside
        className={`
          hidden md:flex md:flex-col h-screen sticky top-0 
          bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-sm
          ${isScrollable ? 'overflow-y-auto' : 'overflow-hidden'}
          ${sidebarWidth}
          transition-all duration-300 ease-in-out
          ${isCompact && isHoveringSidebar ? 'w-64' : sidebarWidth}
        `}
        onMouseEnter={() => setIsHoveringSidebar(true)}
        onMouseLeave={() => setIsHoveringSidebar(false)}
      >
        {/* Brand */}
        <div className={`px-5 py-6 border-b border-gray-200/50 shrink-0 ${isCompact ? 'px-3' : ''} ${isCompact && isHoveringSidebar ? 'px-5' : ''}`}>
          <div className={`flex items-center gap-3 ${isCompact && !isHoveringSidebar ? 'justify-center' : ''}`}>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center font-bold shadow-lg">
              <span className={`${isCompact && !isHoveringSidebar ? 'text-sm' : 'text-xl'}`}>DE</span>
            </div>
            {(!isCompact || isHoveringSidebar) && (
              <div className={`${isHoveringSidebar ? 'animate-in slide-in-from-left-2 duration-200' : ''}`}>
                <p className="font-bold text-gray-900 text-lg">Daily Expense</p>
                <p className="text-xs text-gray-500">Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* User profile */}
        <div className={`px-5 py-4 border-b border-gray-200/50 shrink-0 ${isCompact ? 'px-3' : ''} ${isCompact && isHoveringSidebar ? 'px-5' : ''}`}>
          <div className={`flex items-center gap-3 ${isCompact && !isHoveringSidebar ? 'justify-center' : ''}`}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
              <User size={20} />
            </div>
            {(!isCompact || isHoveringSidebar) && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {userLoading ? "Loading..." : (user?.name || "User")}
                </p>
                {/* <p className="text-xs text-gray-500 truncate">
                  {userLoading ? "" : user.email}
                </p> */}
              </div>
            )}
          </div>
        </div>

        {/* Nav - Scrollable area */}
        <nav className={`
          flex-1 py-6 
          ${isCompact && !isHoveringSidebar ? 'px-2' : 'px-3'}
          ${isScrollable ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}
        `}>
          {(!isCompact || isHoveringSidebar) && (
            <p className="px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 shrink-0">
              Navigation
            </p>
          )}
          <NavItems compact={isCompact && !isHoveringSidebar} />
        </nav>

        {/* Footer with only Logout */}
        <div className={`mt-auto py-4 border-t border-gray-200/50 shrink-0 ${isCompact && !isHoveringSidebar ? 'px-2' : 'px-5'}`}>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            type="button"
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`w-full flex items-center ${isCompact && !isHoveringSidebar ? 'justify-center px-3' : 'justify-between px-4'} py-3.5 rounded-xl text-sm text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200 group relative`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <LogOut size={16} className="text-red-600 group-hover:text-white" />
              </div>
              {(!isCompact || isHoveringSidebar) && (
                <div className="text-left">
                  <p className="font-medium">Logout</p>
                </div>
              )}
            </div>
            {(!isCompact || isHoveringSidebar) && (
              <ChevronRight size={16} className="text-red-400 group-hover:text-red-200" />
            )}
          </button>

          {/* Logout Hover Popup for compact mode */}
          {isCompact && !isHoveringSidebar && hoveredItem === 'logout' && (
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50">
              <div className="bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-in slide-in-from-left-1 duration-200">
                Logout
                {/* Triangle pointer */}
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
          )}
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
                  <p className="font-semibold text-gray-900">
                    {userLoading ? "Loading..." : (user?.name || "User")}
                  </p>
                  {/* <p className="text-xs text-gray-500 truncate">
                    {userLoading ? "" : user.email}
                  </p> */}

                </div>
              </div>
            </div>

            {/* Drawer body - Scrollable area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase px-1 mb-3">
                Navigation
              </p>
              <NavItems compact isMobile />
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
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }

        /* Animation keyframes */
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation: slideInFromLeft 0.2s ease-out;
        }

        .slide-in-from-left-1 {
          animation: slideInFromLeft 0.1s ease-out;
        }

        .slide-in-from-left-2 {
          animation: slideInFromLeft 0.2s ease-out;
        }
      `}</style>
    </>
  );
}