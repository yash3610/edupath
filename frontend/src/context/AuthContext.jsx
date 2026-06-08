import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken } from "../services/api.js";

const AuthContext = createContext(null);
const SESSION_KEY = "edupath_session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(session?.token || session?.accessToken));

  useEffect(() => {
    const token = session?.token || session?.accessToken || "";
    setAccessToken(token);
    if (!token) {
      setLoading(false);
      return;
    }

    api.me()
      .then((result) => {
        const nextSession = { ...session, user: result.data.user };
        setSession(nextSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      })
      .catch(() => {
        setSession(null);
        setAccessToken("");
        localStorage.removeItem(SESSION_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  function saveSession(nextSession) {
    const normalizedSession = {
      ...nextSession,
      token: nextSession.token || nextSession.accessToken,
    };
    setSession(normalizedSession);
    setAccessToken(normalizedSession.token || "");
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession));
  }

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || session?.accessToken || "",
    loading,
    login: async (credentials) => {
      const result = await api.login(credentials);
      saveSession(result.data);
      return result;
    },
    register: async (details) => {
      const result = await api.register(details);
      saveSession(result.data);
      return result;
    },
    logout: () => {
      setSession(null);
      setAccessToken("");
      localStorage.removeItem(SESSION_KEY);
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
