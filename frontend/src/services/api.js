const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
let accessToken = "";

export function setAccessToken(token) {
  accessToken = token;
}

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

export async function apiBlobRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    ...options,
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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    body: formData,
  });
  const result = await response.json();
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
  me: () => apiRequest("/api/auth/me"),
  notifications: (limit = 5) => apiRequest(`/api/notifications?unread=true&limit=${limit}`),
  deleteNotification: (notificationId) => apiRequest(`/api/notifications/${encodeURIComponent(notificationId)}`, { method: "DELETE" }),
  order: (payload) => apiRequest("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  myOrders: () => apiRequest("/api/orders/my"),
};
