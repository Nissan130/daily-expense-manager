// src/context/GlobalContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const GlobalContext = createContext(null);

const getStored = (key) =>
  sessionStorage.getItem(key) ?? localStorage.getItem(key) ?? null;

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

export function GlobalProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    getStored("isAuthenticated") === "true"
  );

  const [token, setToken] = useState(getStored("user_token") || "");
  const [user, setUser] = useState({
    name: getStored("userName") || "",
    email: getStored("userEmail") || "",
  });

  const persistAuth = ({ user: u, user_token, rememberMe }) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // avoid confusion between storages
    clearAuthStorage();

    // mark authenticated in BOTH (so route guards can find it anywhere)
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
    const storedToken = token || getStored("user_token");
    const storedEmail = user?.email || getStored("userEmail") || "";

    if (!storedToken) {
      // no token => cannot call /me, fallback to storage-only user
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
      // fallback to storage
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

    if (!res.ok) {
      return {
        ok: false,
        message: payload?.message || "Sign in failed. Please try again.",
      };
    }

    const user_token = payload?.user_token;
    if (!user_token) {
      return {
        ok: false,
        message: "No user_token received from server. Please check backend signin response.",
      };
    }

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

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: payload?.message || "Signup failed. Please try again.",
      };
    }

    // If your backend returns created user in payload.user, we can store it as "pre-fill"
    const createdUser = payload?.user || { name, email };
    // You currently navigate to /signin after signup, so we do NOT auto-login here.
    localStorage.setItem("userEmail", createdUser.email || email);
    localStorage.setItem("userName", createdUser.name || name);

    return { ok: true, payload };
  };

  const logout = () => {
    clearAuthStorage();
    setIsAuthenticated(false);
    setToken("");
    setUser({ name: "", email: "" });
  };

  // initial hydration
  useEffect(() => {
    const storedAuth = getStored("isAuthenticated") === "true";
    const storedToken = getStored("user_token") || "";
    const storedEmail = getStored("userEmail") || "";
    const storedName = getStored("userName") || "";

    setIsAuthenticated(storedAuth);
    setToken(storedToken);
    setUser({
      name: storedName || "",
      email: storedEmail || "",
    });

    setAuthLoading(false);
  }, []);

  // if authenticated and token exists, try to refresh user info
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchMe();
    }
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
    }),
    [isAuthenticated, authLoading, user, token, userLoading]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside <GlobalProvider>");
  return ctx;
};
