const API_BASE_URL = "https://capstone-prisma.onrender.com/api";

const Auth = {
  getToken() {
    return localStorage.getItem("token");
  },
  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  updateUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  isLoggedIn() {
    return Boolean(this.getToken());
  },
};

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth && Auth.getToken()) {
    headers.Authorization = `Bearer ${Auth.getToken()}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload;
  try {
    payload = await res.json();
  } catch (e) {
    payload = { message: "Phản hồi không hợp lệ từ server" };
  }

  if (!res.ok) {
    if (res.status === 401) {
      Auth.clear();
    }
    throw new Error(payload.message || `Lỗi ${res.status}`);
  }

  return payload.data;
}

const Api = {
  register: (data) =>
    apiRequest("/auth/register", { method: "POST", body: data, auth: false }),
  login: (data) =>
    apiRequest("/auth/login", { method: "POST", body: data, auth: false }),

  getImages: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/images${qs ? `?${qs}` : ""}`);
  },
  getImageById: (id) => apiRequest(`/images/${id}`),
  createImage: (data) => apiRequest("/images", { method: "POST", body: data }),
  deleteImage: (id) => apiRequest(`/images/${id}`, { method: "DELETE" }),

  getComments: (imageId) => apiRequest(`/images/${imageId}/comments`),
  addComment: (imageId, noiDung) =>
    apiRequest(`/images/${imageId}/comments`, {
      method: "POST",
      body: { noiDung },
    }),

  checkSaved: (imageId) => apiRequest(`/images/${imageId}/saved`),
  toggleSave: (imageId) =>
    apiRequest(`/images/${imageId}/save`, { method: "POST" }),

  getMe: () => apiRequest("/users/me"),
  updateMe: (data) => apiRequest("/users/me", { method: "PUT", body: data }),
  getSavedImages: () => apiRequest("/users/me/saved-images"),
  getCreatedImages: () => apiRequest("/users/me/created-images"),
};
