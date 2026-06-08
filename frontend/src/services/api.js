const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
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

export const api = {
  health: () => apiRequest("/api/health"),
  courses: () => apiRequest("/api/courses"),
  blogs: () => apiRequest("/api/blogs"),
  events: () => apiRequest("/api/events"),
  products: () => apiRequest("/api/products"),
  team: () => apiRequest("/api/team"),
  contact: (payload) => apiRequest("/api/contact", { method: "POST", body: JSON.stringify(payload) }),
  newsletter: (payload) => apiRequest("/api/newsletter", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  order: (payload) => apiRequest("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
};
