const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = resolveApiBaseUrl(configuredApiUrl);
let accessToken = "";
let refreshPromise = null;

function resolveApiBaseUrl(value) {
  const source = String(value || "").replace(/\/+$/, "");
  if (typeof window === "undefined") return source;

  try {
    const url = new URL(source);
    const pageHost = window.location.hostname;
    const apiIsLocal = ["localhost", "127.0.0.1"].includes(url.hostname);
    const pageIsLocal = ["localhost", "127.0.0.1"].includes(pageHost);

    if (apiIsLocal && !pageIsLocal) {
      url.hostname = pageHost;
      return url.toString().replace(/\/+$/, "");
    }
  } catch {
    return source;
  }

  return source;
}

export function assetUrl(value) {
  if (!value) return "";

  const source = String(value);
  if (source.startsWith("/uploads/")) return `${API_BASE_URL}${source}`;

  try {
    const url = new URL(source);
    if (url.pathname.startsWith("/uploads/") && ["localhost", "127.0.0.1"].includes(url.hostname)) {
      return `${API_BASE_URL}${url.pathname}${url.search}`;
    }
  } catch {
    return source;
  }

  return source;
}

export function setAccessToken(token) {
  accessToken = token;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        const result = await parseResponse(response);
        if (!response.ok) throw new Error(result.message || "Session expired");
        setAccessToken(result.data?.accessToken || "");
        return result;
      })
      .catch((error) => {
        setAccessToken("");
        if (typeof window !== "undefined") window.dispatchEvent(new Event("edupath:session-expired"));
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function authorizedFetch(endpoint, options = {}, retry = true) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && retry && !endpoint.startsWith("/api/auth/")) {
    await refreshAccessToken();
    return authorizedFetch(endpoint, options, false);
  }
  return response;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: response.statusText || "Request failed" };
  }
}

export async function apiRequest(endpoint, options = {}) {
  const response = await authorizedFetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

export async function apiBlobRequest(endpoint, options = {}) {
  const response = await authorizedFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Download failed";
    try {
      const result = await response.json();
      message = result.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.blob();
}

export async function apiFormRequest(endpoint, formData, options = {}) {
  const response = await authorizedFetch(endpoint, {
    method: options.method || "POST",
    headers: {
      ...options.headers,
    },
    body: formData,
  });
  const result = await parseResponse(response);
  if (!response.ok) throw new Error(result.message || "Upload failed");
  return result;
}

export const api = {
  health: () => apiRequest("/api/health"),
  courses: () => apiRequest("/api/courses"),
  course: (slug) => apiRequest(`/api/courses/${encodeURIComponent(slug)}`),
  blogs: () => apiRequest("/api/blogs"),
  events: () => apiRequest("/api/events"),
  products: () => apiRequest("/api/products"),
  team: () => apiRequest("/api/team"),
  contact: (payload) => apiRequest("/api/contact", { method: "POST", body: JSON.stringify(payload) }),
  newsletter: (payload) => apiRequest("/api/newsletter", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  refresh: () => refreshAccessToken(),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" }),
  me: () => apiRequest("/api/auth/me"),
  notifications: (limit = 5) => apiRequest(`/api/notifications?unread=true&limit=${limit}`),
  deleteNotification: (notificationId) => apiRequest(`/api/notifications/${encodeURIComponent(notificationId)}`, { method: "DELETE" }),
  order: (payload) => apiRequest("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  myOrders: () => apiRequest("/api/orders/my"),
};
