import { useCallback, useEffect, useState } from "react";
import { hydrateDashboardData } from "../services/dashboardDataApi.js";

export default function useDashboardHydration(role) {
  const [state, setState] = useState({ loading: true, error: "" });

  const hydrate = useCallback(async () => {
    try {
      setState({ loading: true, error: "" });
      await hydrateDashboardData(role);
      setState({ loading: false, error: "" });
    } catch (error) {
      console.warn("Dashboard hydration skipped:", error);
      setState({ loading: false, error: "" });
    }
  }, [role]);

  useEffect(() => { hydrate(); }, [hydrate]);
  return { ...state, retry: hydrate };
}
