import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear session and bounce to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && err.response?.status === 401) {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
