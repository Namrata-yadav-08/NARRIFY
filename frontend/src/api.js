import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: API_URL });

// attach token on requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// global response handler: clear auth on 401 so UI can react
api.interceptors.response.use(
  res => res,
  err => {
    try {
      const status = err?.response?.status;
      if (status === 401) {
        // clear local auth and notify app
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.dispatchEvent(new Event("authChanged"));
        // optional: log for debugging
        console.warn("API: 401 Unauthorized — cleared local auth");
      }
    } catch (e) {
      // ignore interceptor errors
      console.error("api interceptor error", e);
    }
    return Promise.reject(err);
  }
);

export default api;
