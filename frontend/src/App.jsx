import React from "react";
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

export default function App() {
  return (
    <React.Suspense fallback={<AppLoadingScreen />}>
      <AppRoutes />
    </React.Suspense>
  );
}
