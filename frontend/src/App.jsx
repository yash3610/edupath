import React, { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";

function AppLoadingScreen() {
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

export default function App() {
  return (
    <React.Suspense fallback={<AppLoadingScreen />}>
      <ScrollToTop />
      <AppRoutes />
    </React.Suspense>
  );
}
