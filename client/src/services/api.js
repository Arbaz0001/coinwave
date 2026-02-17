// src/services/api.js
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const API_URL = API_CONFIG.API_BASE;

console.log("Running on:", globalThis.location.hostname);
console.log("API Base URL:", API_CONFIG.API_BASE);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // prevent hanging requests
});

// 🔹 Add Authorization Header if token exists
api.interceptors.request.use(
  (config) => {
    try {
      const accessToken =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("user_token") ||
        localStorage.getItem("token") ||
        null;

      const raw = localStorage.getItem("auth");
      if (raw) {
        const auth = JSON.parse(raw);
        if (auth?.accessToken) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
          return config;
        }
      }

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
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
        globalThis.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
