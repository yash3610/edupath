import { useEffect } from "react";
import { toast } from "sonner";
import useDashboardHydration from "../../hooks/useDashboardHydration.js";

export default function DashboardDataGate({ role, children }) {
  const { loading, error, retry } = useDashboardHydration(role);
  useEffect(() => {
    const onSaveError = (event) => toast.error(event.detail || "Dashboard change could not be saved");
    window.addEventListener("edupath:dashboard-save-error", onSaveError);
    return () => window.removeEventListener("edupath:dashboard-save-error", onSaveError);
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Dashboard data unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button onClick={retry} className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Try again</button>
        </div>
      </div>
    );
  }

  return children;
}
