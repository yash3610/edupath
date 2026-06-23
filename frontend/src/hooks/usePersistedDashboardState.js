import { useCallback, useRef, useState } from "react";
import { saveDashboardDataset } from "../services/dashboardDataApi.js";

const identity = (value) => value;

export default function usePersistedDashboardState(role, key, initialValue, serialize = identity) {
  const [value, setReactValue] = useState(initialValue);
  const valueRef = useRef(value);
  const queueRef = useRef(Promise.resolve());

  const setValue = useCallback((nextValue) => {
    const next = typeof nextValue === "function" ? nextValue(valueRef.current) : nextValue;
    valueRef.current = next;
    setReactValue(next);

    const payload = serialize(next);
    queueRef.current = queueRef.current
      .catch(() => undefined)
      .then(() => saveDashboardDataset(role, key, payload))
      .catch((error) => {
        console.error(`Failed to save ${role}.${key}:`, error);
        window.dispatchEvent(new CustomEvent("edupath:dashboard-save-error", { detail: error.message }));
      });
  }, [key, role, serialize]);

  return [value, setValue];
}
