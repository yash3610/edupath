import { useEffect } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/services/api";
import { applyDashboardTheme, readStoredDashboardTheme } from "@/utils/themePreferences";

export default function LumaDataGate({ children }) {
  useEffect(() => {
    const onSaveError = (event) => toast.error(event.detail || "Dashboard change could not be saved");
    window.addEventListener("edupath:dashboard-save-error", onSaveError);
    return () => window.removeEventListener("edupath:dashboard-save-error", onSaveError);
  }, []);

  useEffect(() => {
    applyDashboardTheme(readStoredDashboardTheme());
    let cancelled = false;

    apiRequest("/api/settings")
      .then((response) => {
        if (cancelled) return;
        const data = response?.data || {};
        applyDashboardTheme({
          theme: data.theme,
          accent: data.accent,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return children;
}
