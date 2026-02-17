import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_CONFIG } from "../config/api.config";

// ----------------- SMART BASE URL -----------------
const BASE_URL = API_CONFIG.BASE_URL;

console.log("Running on:", window.location.hostname);
console.log("API Base URL:", API_CONFIG.BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ----------------- REQUEST INTERCEPTOR -----------------
axiosInstance.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("accessToken");

  if (token && isTokenExpired(token)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) token = refreshed;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;

// ------------------ Helpers ------------------

function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearAuthAndRedirect();
      return null;
    }

    const response = await fetch(
      `${BASE_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error("Refresh token expired");
    }

    const data = await response.json();
    const { accessToken } = data;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);

      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      authData.accessToken = accessToken;
      localStorage.setItem("auth", JSON.stringify(authData));

      return accessToken;
    }

    return null;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    clearAuthAndRedirect();
    return null;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("auth");
  localStorage.removeItem("cw_user");
  localStorage.removeItem("user_token");
  window.location.href = "/login";
}
