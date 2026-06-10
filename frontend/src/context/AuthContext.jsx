import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, setAccessToken } from "../services/api.js";

const AuthContext = createContext(null);
const SESSION_KEY = "edupath_session";

export function dashboardPathForRole(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "instructor") return "/instructor/dashboard";
  return "/dashboard";
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
      setAccessToken(stored?.token || stored?.accessToken || "");
      return stored;
    } catch {
      setAccessToken("");
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(session?.token || session?.accessToken));
  const sessionVersion = useRef(0);

  useEffect(() => {
    const version = ++sessionVersion.current;
    const token = session?.token || session?.accessToken || "";
    setAccessToken(token);
    if (!token) {
      setLoading(false);
      return;
    }

    api.me()
      .then((result) => {
        if (sessionVersion.current !== version) return;
        const nextSession = { ...session, user: result.data.user };
        setSession(nextSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      })
      .catch(() => {
        if (sessionVersion.current !== version) return;
        setSession(null);
        setAccessToken("");
        localStorage.removeItem(SESSION_KEY);
      })
      .finally(() => {
        if (sessionVersion.current === version) setLoading(false);
      });
  }, []);

  function saveSession(nextSession) {
    const normalizedSession = {
      ...nextSession,
      token: nextSession.token || nextSession.accessToken,
    };
    sessionVersion.current += 1;
    setAccessToken(normalizedSession.token || "");
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession));
    setSession(normalizedSession);
    setLoading(false);
    return normalizedSession;
  }

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || session?.accessToken || "",
    loading,
    login: async (credentials) => {
      setLoading(true);
      try {
        const result = await api.login(credentials);
        const saved = saveSession(result.data);
        return { ...result, data: saved };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    register: async (details) => {
      setLoading(true);
      try {
        const result = await api.register(details);
        const saved = saveSession(result.data);
        return { ...result, data: saved };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    logout: () => {
      sessionVersion.current += 1;
      setSession(null);
      setLoading(false);
      setAccessToken("");
      localStorage.removeItem(SESSION_KEY);
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
