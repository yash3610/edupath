import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { dashboardPathForRole, useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRoles, loginPath = "/login" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 dark:bg-slate-950">
      <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff723a]" />
        <p className="mt-4 text-sm font-extrabold text-slate-700 dark:text-slate-200">Opening your dashboard...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to={loginPath} replace state={{ from: location }} />;
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }
  return children;
}
