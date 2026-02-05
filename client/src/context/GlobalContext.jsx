// src/context/GlobalContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const GlobalContext = createContext(null);

const getStored = (key) => sessionStorage.getItem(key) ?? localStorage.getItem(key) ?? null;

const clearAuthStorage = () => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user_token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");

  sessionStorage.removeItem("isAuthenticated");
  sessionStorage.removeItem("user_token");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("userName");
};

// ✅ Dashboard selection persistence keys
const DASH_PERIOD_KEY = "dashboardPeriod";
const DASH_RANGE_KEY = "dashboardRange";

const readJSON = (key, fallback) => {
  try {
    const raw = getStored(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export function GlobalProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(getStored("isAuthenticated") === "true");
  const [token, setToken] = useState(getStored("user_token") || "");
  const [user, setUser] = useState({
    name: getStored("userName") || "",
    email: getStored("userEmail") || "",
  });

  // ---------------------------------------
  // Helpers
  // ---------------------------------------
  const getUserToken = () => token || getStored("user_token") || "";

  const authHeaders = () => {
    const t = getUserToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  async function safeJson(res) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  const buildExpensesUrl = (params = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    return qs.toString() ? `${API_BASE}/api/expenses?${qs.toString()}` : `${API_BASE}/api/expenses`;
  };

  // ---------------------------------------
  // ✅ Dashboard selection state (PERSISTED)
  // ---------------------------------------
  const [dashboardPeriodState, setDashboardPeriodState] = useState(getStored(DASH_PERIOD_KEY) || "month"); // month | year | all | custom
  const [dashboardRangeState, setDashboardRangeState] = useState(readJSON(DASH_RANGE_KEY, { from: "", to: "" }));

  // Persist helpers (save in BOTH, like your auth)
  const persistDashPeriod = (p) => {
    sessionStorage.setItem(DASH_PERIOD_KEY, p);
    localStorage.setItem(DASH_PERIOD_KEY, p);
  };

  const persistDashRange = (range) => {
    const raw = JSON.stringify(range);
    sessionStorage.setItem(DASH_RANGE_KEY, raw);
    localStorage.setItem(DASH_RANGE_KEY, raw);
  };

  // Wrapped setters (pages change হলেও period/range থাকবে)
  const setDashboardPeriod = (p) => {
    setDashboardPeriodState(p);
    persistDashPeriod(p);

    // optional: if user switches away from custom, keep range but you can also clear it:
    // if (p !== "custom") persistDashRange({ from: "", to: "" });
  };

  const setDashboardRange = (updater) => {
    setDashboardRangeState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const safeNext = {
        from: next?.from || "",
        to: next?.to || "",
      };
      persistDashRange(safeNext);
      return safeNext;
    });
  };

  // ensure state is synced with storage on first mount (covers refresh/layout remount edge cases)
  useEffect(() => {
    const p = getStored(DASH_PERIOD_KEY);
    if (p && p !== dashboardPeriodState) setDashboardPeriodState(p);

    const r = readJSON(DASH_RANGE_KEY, null);
    if (r && (r.from !== dashboardRangeState.from || r.to !== dashboardRangeState.to)) {
      setDashboardRangeState({ from: r.from || "", to: r.to || "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================
  // Expenses (Dashboard / Period list)
  // =======================================
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState("");
  const expensesReqSeqRef = useRef(0);

  const fetchExpenses = async (params = {}) => {
    const t = getUserToken();
    if (!t) return { ok: false, message: "No token" };

    const seq = ++expensesReqSeqRef.current;
    setExpensesLoading(true);
    setExpensesError("");

    try {
      const url = buildExpensesUrl(params);
      const res = await fetch(url, { headers: authHeaders() });
      const payload = await safeJson(res);

      if (!res.ok) throw new Error(payload?.message || "Failed to load expenses");
      if (seq !== expensesReqSeqRef.current) return { ok: true, stale: true };

      setExpenses(Array.isArray(payload?.expenses) ? payload.expenses : []);
      return { ok: true, payload };
    } catch (e) {
      const msg = e?.message || "Failed to load expenses";
      setExpensesError(msg);
      return { ok: false, message: msg };
    } finally {
      setExpensesLoading(false);
    }
  };

  // =======================================
  // Expenses (History / ALL list)
  // =======================================
  const [allExpenses, setAllExpenses] = useState([]);
  const [allExpensesLoading, setAllExpensesLoading] = useState(false);
  const [allExpensesError, setAllExpensesError] = useState("");
  const allExpensesReqSeqRef = useRef(0);

  const fetchAllExpenses = async () => {
    const t = getUserToken();
    if (!t) return { ok: false, message: "No token" };

    const seq = ++allExpensesReqSeqRef.current;
    setAllExpensesLoading(true);
    setAllExpensesError("");

    try {
      const res = await fetch(buildExpensesUrl({}), { headers: authHeaders() });
      const payload = await safeJson(res);

      if (!res.ok) throw new Error(payload?.message || "Failed to load expenses");
      if (seq !== allExpensesReqSeqRef.current) return { ok: true, stale: true };

      setAllExpenses(Array.isArray(payload?.expenses) ? payload.expenses : []);
      return { ok: true, payload };
    } catch (e) {
      const msg = e?.message || "Failed to load expenses";
      setAllExpensesError(msg);
      return { ok: false, message: msg };
    } finally {
      setAllExpensesLoading(false);
    }
  };

  const prependExpense = (created) => {
    if (!created) return;
    setExpenses((prev) => [created, ...prev]);
    setAllExpenses((prev) => [created, ...prev]);
  };

  const clearExpenses = () => {
    setExpenses([]);
    setAllExpenses([]);
    setExpensesError("");
    setAllExpensesError("");
  };

  // =======================================
  // Budgets Global State
  // =======================================
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [budgetsError, setBudgetsError] = useState("");

  const fetchBudgets = async () => {
    const t = getUserToken();
    if (!t) return { ok: false, message: "No token" };

    setBudgetsLoading(true);
    setBudgetsError("");

    try {
      const res = await fetch(`${API_BASE}/api/budgets`, { headers: authHeaders() });
      const payload = await safeJson(res);

      if (!res.ok) throw new Error(payload?.message || "Failed to load budgets");

      setBudgets(Array.isArray(payload?.budgets) ? payload.budgets : []);
      return { ok: true, payload };
    } catch (e) {
      const msg = e?.message || "Failed to load budgets";
      setBudgetsError(msg);
      return { ok: false, message: msg };
    } finally {
      setBudgetsLoading(false);
    }
  };

  const prependBudget = (created) => {
    if (!created) return;
    setBudgets((prev) => [created, ...prev]);
  };

  const clearBudgets = () => {
    setBudgets([]);
    setBudgetsError("");
  };

  // ---------------------------------------
  // Auth functions
  // ---------------------------------------
  const persistAuth = ({ user: u, user_token, rememberMe }) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    clearAuthStorage();

    localStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("isAuthenticated", "true");

    storage.setItem("user_token", user_token);
    storage.setItem("userEmail", u?.email || "");
    storage.setItem("userName", u?.name || (u?.email?.split("@")?.[0] ?? "User"));

    setIsAuthenticated(true);
    setToken(user_token);
    setUser({
      name: u?.name || (u?.email?.split("@")?.[0] ?? "User"),
      email: u?.email || "",
    });
  };

  const fetchMe = async () => {
    const storedToken = getUserToken();
    const storedEmail = user?.email || getStored("userEmail") || "";

    if (!storedToken) {
      setUser((prev) => ({
        name: prev?.name || getStored("userName") || "User",
        email: prev?.email || storedEmail,
      }));
      return;
    }

    setUserLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to load user");

      const serverUser = data?.user || {};
      setUser({
        name: serverUser?.name || getStored("userName") || "User",
        email: serverUser?.email || storedEmail,
      });
    } catch {
      setUser({
        name: getStored("userName") || user?.name || "User",
        email: storedEmail,
      });
    } finally {
      setUserLoading(false);
    }
  };

  const signIn = async ({ email, password, rememberMe }) => {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) return { ok: false, message: payload?.message || "Sign in failed. Please try again." };

    const user_token = payload?.user_token;
    if (!user_token) return { ok: false, message: "No user_token received from server. Please check backend signin response." };

    persistAuth({ user: payload?.user, user_token, rememberMe });
    return { ok: true, payload };
  };

  const signUp = async ({ name, email, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) return { ok: false, status: res.status, message: payload?.message || "Signup failed. Please try again." };

    const createdUser = payload?.user || { name, email };
    localStorage.setItem("userEmail", createdUser.email || email);
    localStorage.setItem("userName", createdUser.name || name);

    return { ok: true, payload };
  };

  const logout = () => {
    clearAuthStorage();
    setIsAuthenticated(false);
    setToken("");
    setUser({ name: "", email: "" });

    clearExpenses();
    clearBudgets();
  };

  // initial hydration
  useEffect(() => {
    const storedAuth = getStored("isAuthenticated") === "true";
    const storedToken = getStored("user_token") || "";
    const storedEmail = getStored("userEmail") || "";
    const storedName = getStored("userName") || "";

    setIsAuthenticated(storedAuth);
    setToken(storedToken);
    setUser({ name: storedName || "", email: storedEmail || "" });

    setAuthLoading(false);
  }, []);

  // refresh user if authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const value = useMemo(
    () => ({
      API_BASE,
      isAuthenticated,
      authLoading,

      user,
      token,
      userLoading,

      signIn,
      signUp,
      fetchMe,
      logout,

      // ✅ persisted dashboard selection
      dashboardPeriod: dashboardPeriodState,
      setDashboardPeriod,
      dashboardRange: dashboardRangeState,
      setDashboardRange,

      // ✅ dashboard expenses
      expenses,
      expensesLoading,
      expensesError,
      fetchExpenses,

      // ✅ history expenses (ALL)
      allExpenses,
      allExpensesLoading,
      allExpensesError,
      fetchAllExpenses,

      prependExpense,
      clearExpenses,

      // ✅ budgets
      budgets,
      budgetsLoading,
      budgetsError,
      fetchBudgets,
      prependBudget,
      clearBudgets,
    }),
    [
      isAuthenticated,
      authLoading,
      user,
      token,
      userLoading,

      dashboardPeriodState,
      dashboardRangeState,

      expenses,
      expensesLoading,
      expensesError,

      allExpenses,
      allExpensesLoading,
      allExpensesError,

      budgets,
      budgetsLoading,
      budgetsError,
    ]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside <GlobalProvider>");
  return ctx;
};
