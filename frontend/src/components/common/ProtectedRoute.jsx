import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="section-gap text-center">Checking your session...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
