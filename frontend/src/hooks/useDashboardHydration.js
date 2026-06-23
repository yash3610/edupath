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
      setState({ loading: false, error: error.message || "Dashboard data could not be loaded" });
    }
  }, [role]);

  useEffect(() => { hydrate(); }, [hydrate]);
  return { ...state, retry: hydrate };
}
