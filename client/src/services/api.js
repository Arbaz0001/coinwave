// src/services/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://api.coinpay0.com/api";

const api = axios.create({
  baseURL,
  timeout: 10000, // prevent hanging requests
});

// 🔹 Add Authorization Header if token exists
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const auth = JSON.parse(raw);
        if (auth?.accessToken) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
      }
    } catch (e) {
      console.error("❌ Error parsing auth token:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("⚠️ Unauthorized! Clearing auth and redirecting...");
        localStorage.removeItem("auth");
        // Optional: redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
