const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE_URL = resolveApiBaseUrl(configuredApiUrl);
let accessToken = "";
let refreshPromise = null;
let accessTokenExpiresAt = 0;
let sessionExpiredDispatched = false;
const TOKEN_REFRESH_WINDOW_MS = 60 * 1000;

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
  if (/^[a-f\d]{24}$/i.test(source)) return `${API_BASE_URL}/api/assets/${source}`;
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

export function apiUrl(path) {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function setAccessToken(token) {
  accessToken = token;
  accessTokenExpiresAt = getTokenExpiryMs(token);
  if (token) sessionExpiredDispatched = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("edupath:token-updated", { detail: { accessToken: token || "" } }));
  }
}

export function getAccessToken() {
  return accessToken;
}

function notifySessionExpired() {
  if (sessionExpiredDispatched) return;
  sessionExpiredDispatched = true;
  if (typeof window !== "undefined") window.dispatchEvent(new Event("edupath:session-expired"));
}

async function refreshAccessToken({ broadcastOnFailure = true } = {}) {
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
        if (broadcastOnFailure) notifySessionExpired();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function getTokenExpiryMs(token) {
  if (!token) return 0;
  try {
    const [, payload] = token.split(".");
    if (!payload) return 0;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    return decoded.exp ? decoded.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

async function ensureFreshAccessToken(endpoint) {
  if (endpoint.startsWith("/api/auth/")) return;
  if (accessToken && accessTokenExpiresAt && Date.now() >= accessTokenExpiresAt - TOKEN_REFRESH_WINDOW_MS) {
    await refreshAccessToken();
  }
}

async function authorizedFetch(endpoint, options = {}, retry = true) {
  if (retry) await ensureFreshAccessToken(endpoint);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && retry && !endpoint.startsWith("/api/auth/")) {
    await refreshAccessToken({ broadcastOnFailure: true });
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
  refresh: () => refreshAccessToken({ broadcastOnFailure: false }),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" }),
  me: () => apiRequest("/api/auth/me"),
  notifications: (options = 5) => {
    const params = new URLSearchParams();
    if (typeof options === "number") {
      params.set("limit", String(options));
      params.set("unread", "true");
    } else {
      if (options.limit) params.set("limit", String(options.limit));
      if (options.unread) params.set("unread", "true");
      if (options.summary) params.set("summary", "true");
    }
    return apiRequest(`/api/notifications${params.toString() ? `?${params}` : ""}`);
  },
  readNotification: (notificationId) => apiRequest(`/api/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" }),
  readAllNotifications: () => apiRequest("/api/notifications/read-all", { method: "PATCH" }),
  deleteNotification: (notificationId) => apiRequest(`/api/notifications/${encodeURIComponent(notificationId)}`, { method: "DELETE" }),
  order: (payload) => apiRequest("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  myOrders: () => apiRequest("/api/orders/my"),
  dashboardStats: () => apiRequest("/api/student/dashboard-stats"),
  instructorStats: () => apiRequest("/api/instructor/stats"),
};
