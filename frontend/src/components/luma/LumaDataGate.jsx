import { useEffect } from "react";
import { toast } from "sonner";

export default function LumaDataGate({ children }) {
  useEffect(() => {
    const onSaveError = (event) => toast.error(event.detail || "Dashboard change could not be saved");
    window.addEventListener("edupath:dashboard-save-error", onSaveError);
    return () => window.removeEventListener("edupath:dashboard-save-error", onSaveError);
  }, []);

  return children;
}
