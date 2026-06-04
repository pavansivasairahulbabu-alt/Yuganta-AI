import axios from "axios";
import API_URL from "./api";

const api = axios.create({
  baseURL: `${API_URL}/api/admin`,
});

// Interceptor to inject admin authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
