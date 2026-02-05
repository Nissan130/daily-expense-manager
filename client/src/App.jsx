// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ExportData from "./pages/ExportData";
// import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import SignIn from './pages/SIgnIn';

// Component to check authentication
function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/signin" />;
}

// Component to handle sidebar with navigation
function AppWithSidebar() {
  const getActivePage = () => {
    const path = window.location.pathname;
    if (path.includes('history')) return 'History';
    if (path.includes('stats')) return 'Stats';
    if (path.includes('income-manager')) return 'IncomeManager';
    if (path.includes('export')) return 'Export';
    // if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  const handleNavSelect = (key) => {
    switch (key) {
      case 'Dashboard':
        window.location.href = '/';
        break;
      case 'History':
        window.location.href = '/history';
        break;
      case 'Export':
        window.location.href = '/export';
        break;
      // case 'Settings':
      //   window.location.href = '/settings';
        break;
      default:
        window.location.href = '/';
    }
  };

  return (
    <div className="md:flex min-h-screen bg-gray-50">
      <Sidebar active={getActivePage()} onSelect={handleNavSelect} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/history" element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          } />
          <Route path="/export" element={
            <PrivateRoute>
              <ExportData />
            </PrivateRoute>
          } />
          {/* <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } /> */}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<AppWithSidebar />} />
      </Routes>
    </Router>
  );
}