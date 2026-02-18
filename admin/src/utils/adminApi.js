// src/utils/adminApi.js
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

// ----------------- SMART BASE URL -----------------
const baseURL = API_CONFIG.BASE_URL;

console.log("Running on:", window.location.hostname);
console.log("API Base URL:", API_CONFIG.BASE_URL);

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// ----------------- TOKEN HELPER -----------------
const decodeJwtPayload = (token) => {
  try {
    const parts = token?.split(".");
    if (!parts || parts.length < 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

const isJwtInvalidOrExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload?.exp;
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};

const getAdminToken = () => {
  const candidates = [
    localStorage.getItem("admin_token"),
    localStorage.getItem("adminToken"),
    localStorage.getItem("cw_admin_token"),
  ];

  try {
    const raw = localStorage.getItem("adminAuth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken) {
        candidates.push(parsed.accessToken);
      }
    }
  } catch {
    // ignore malformed adminAuth
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "string") continue;
    const normalized = candidate
      .trim()
      .replace(/^Bearer\s+/i, "")
      .replace(/^Bearer\s+/i, "")
      .replace(/^"/, "")
      .replace(/"$/, "");

    if (!normalized || isJwtInvalidOrExpired(normalized)) continue;
    return normalized;
  }

  return null;
};

// ----------------- INTERCEPTOR -----------------
API.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------- ADMIN LOGIN -----------------
export const loginAdmin = async ({ identifier, password }) => {
  const { data } = await API.post("/api/admin/login", {
    identifier,
    password,
  });
  return data;
};

// ----------------- USERS -----------------
export const fetchUsers = async () => {
  const { data } = await API.get("/api/admin/users");
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await API.put(`/api/admin/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await API.delete(`/api/admin/users/${id}`);
  return data;
};

// ----------------- WALLET -----------------
export const setUserBalance = async (userId, amount) => {
  const { data } = await API.put(
    `/api/balance/admin/${userId}/set`,
    { amount }
  );
  return data;
};

export default API;
