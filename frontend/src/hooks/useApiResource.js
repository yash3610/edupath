import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function useApiResource(resourceName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadResource() {
      try {
        setLoading(true);
        const result = await api[resourceName]();
        if (active) setData(result.data || []);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResource();

    return () => {
      active = false;
    };
  }, [resourceName]);

  return { data, loading, error };
}
