const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const pendingGetRequests = new Map();

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, authenticated = true } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authenticated && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(`Unable to connect to the Event Connect API at ${API_BASE_URL}.`);
  }

  const responseText = await response.text();
  let data = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new ApiError("The server returned an invalid response.", response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed with status ${response.status}.`, response.status);
  }

  return data;
}

function get(path) {
  const key = `${path}:${localStorage.getItem("token") || ""}`;
  if (pendingGetRequests.has(key)) return pendingGetRequests.get(key);

  const pendingRequest = request(path).finally(() => pendingGetRequests.delete(key));
  pendingGetRequests.set(key, pendingRequest);
  return pendingRequest;
}

export const authApi = {
  register: (user) => request("/api/auth/register", {
    method: "POST",
    body: user,
    authenticated: false,
  }),
  login: (credentials, requiredRole) => request("/api/auth/login", {
    method: "POST",
    body: requiredRole ? { ...credentials, requiredRole } : credentials,
    authenticated: false,
  }),
  getCurrentUser: () => get("/api/auth/me"),
};

export const serviceApi = {
  getPublicServices: () => request("/api/services", { authenticated: false }),
  getMyServices: () => get("/api/services/my-services"),
  getProviderStatus: () => get("/api/services/provider-status"),
  getMine: (id) => get(`/api/services/${encodeURIComponent(id)}`),
  create: (service) => request("/api/services", { method: "POST", body: service }),
  publish: (id) => request(`/api/services/${encodeURIComponent(id)}/publish`, { method: "POST" }),
  update: (id, service) => request(`/api/services/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: service,
  }),
  remove: (id) => request(`/api/services/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const bookingApi = {
  create: (booking) => request("/api/bookings", { method: "POST", body: booking }),
  getMyBookings: () => get("/api/bookings/my-bookings"),
  getProviderRequests: () => get("/api/bookings/provider-requests"),
  updateStatus: (id, status) => request(`/api/bookings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  }),
};

export const clientApi = {
  getProfile: () => get("/api/client/profile"),
  updateProfile: (profile) => request("/api/client/profile", {
    method: "PUT",
    body: profile,
  }),
  getDashboardOverview: () => get("/api/client/dashboard/overview"),
};

export const messageApi = {
  getBookingMessages: (bookingId) => get(`/api/messages?bookingId=${encodeURIComponent(bookingId)}`),
  sendBookingMessage: (bookingId, message) => request("/api/messages", {
    method: "POST",
    body: { bookingId, message },
  }),
};

export const providerProfileApi = {
  getMine: () => get("/api/provider-profile/my-profile"),
  create: (profile) => request("/api/provider-profile", { method: "POST", body: profile }),
  update: (profile) => request("/api/provider-profile/my-profile", {
    method: "PUT",
    body: profile,
  }),
};
export const adminApi = {
  getOverview: () => get("/api/admin/overview"),
  getUsers: () => get("/api/admin/users"),
  getProviders: () => get("/api/admin/providers"),
  getBookings: ({ page = 1, limit = 20, status = "", search = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return get(`/api/admin/bookings?${params.toString()}`);
  },
  getPayments: () => get("/api/admin/payments"),
  getServices: () => get("/api/admin/services"),
  getCategories: () => get("/api/admin/categories"),
  getServiceCategoryStats: () => get("/api/admin/service-category/stats"),
  getPlatformSettings: () => get("/api/admin/settings"),
  createService: (service) => request("/api/admin/services", { method: "POST", body: service }),
  updateService: (id, service) => request(`/api/admin/services/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: service,
  }),
  deleteService: (id) => request(`/api/admin/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }),
};