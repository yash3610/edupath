import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, setAccessToken } from "../services/api.js";

const AuthContext = createContext(null);

export function dashboardPathForRole(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "instructor") return "/instructor/dashboard";
  return "/dashboard";
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionVersion = useRef(0);

  useEffect(() => {
    localStorage.removeItem("edupath_session");
    const version = ++sessionVersion.current;
    api.refresh()
      .then((result) => {
        if (sessionVersion.current !== version) return;
        setAccessToken(result.data.accessToken || "");
        setSession({ user: result.data.user, accessToken: result.data.accessToken });
      })
      .catch(() => {
        if (sessionVersion.current !== version) return;
        setSession(null);
        setAccessToken("");
      })
      .finally(() => {
        if (sessionVersion.current === version) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const expireSession = () => {
      sessionVersion.current += 1;
      setSession(null);
      setLoading(false);
      setAccessToken("");
    };
    const syncAccessToken = (event) => {
      const nextAccessToken = event.detail?.accessToken || "";
      setSession((current) => {
        if (!current || current.accessToken === nextAccessToken) return current;
        return { ...current, accessToken: nextAccessToken };
      });
    };
    window.addEventListener("edupath:session-expired", expireSession);
    window.addEventListener("edupath:token-updated", syncAccessToken);
    return () => {
      window.removeEventListener("edupath:session-expired", expireSession);
      window.removeEventListener("edupath:token-updated", syncAccessToken);
    };
  }, []);

  function saveSession(nextSession) {
    const normalizedSession = {
      user: nextSession.user,
      accessToken: nextSession.accessToken,
    };
    sessionVersion.current += 1;
    setAccessToken(normalizedSession.accessToken || "");
    setSession(normalizedSession);
    setLoading(false);
    return normalizedSession;
  }

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.accessToken || "",
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
    updateUser: (user) => {
      setSession((current) => {
        if (!current) return current;
        const nextSession = { ...current, user: { ...current.user, ...user } };
        return nextSession;
      });
    },
    logout: async () => {
      sessionVersion.current += 1;
      try {
        await api.logout();
      } catch {
        // Local logout must still complete when the server is unavailable.
      }
      setSession(null);
      setLoading(false);
      setAccessToken("");
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
