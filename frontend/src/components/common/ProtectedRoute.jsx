import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { dashboardPathForRole, useAuth } from "../../context/AuthContext.jsx";
import DashboardSkeleton from "../luma/DashboardSkeleton.jsx";

export default function ProtectedRoute({ children, allowedRoles, loginPath = "/login" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <DashboardSkeleton />
    </div>
  );
  if (!user) return <Navigate to={loginPath} replace state={{ from: location }} />;
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }
  return children;
}
