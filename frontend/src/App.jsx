import React, { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import DashboardSkeleton from "./components/luma/DashboardSkeleton.jsx";

function AppLoadingScreen() {
  const dashboardLoading = document.documentElement.dataset.appSurface === "dashboard";

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mb-0">Opening dashboard...</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}

function StyleSurfaceSync() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const dashboardPath = /^\/(?:dashboard|admin\/dashboard|instructor\/dashboard)(?:\/|$)/.test(pathname);
    document.documentElement.dataset.appSurface = dashboardPath ? "dashboard" : "public";
    document.body.classList.toggle("luma-dashboard-active", dashboardPath);

    document.querySelectorAll('link[rel="stylesheet"]:not(#luma-dashboard-styles)').forEach((link) => {
      link.media = dashboardPath ? "not all" : "all";
    });

    const dashboardStyles = document.getElementById("luma-dashboard-styles");
    if (dashboardStyles) dashboardStyles.media = dashboardPath ? "all" : "not all";
    if (!dashboardPath) document.documentElement.classList.remove("dark");
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <React.Suspense fallback={<AppLoadingScreen />}>
      <StyleSurfaceSync />
      <ScrollToTop />
      <AppRoutes />
    </React.Suspense>
  );
}
