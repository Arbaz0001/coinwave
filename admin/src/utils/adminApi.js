// src/utils/adminApi.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // keep root as you wanted
  withCredentials: true,
});

// Safe token extractor (handles plain string or { accessToken } object)
const getAdminToken = () => {
  try {
    const raw =
      localStorage.getItem("adminAuth") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("cw_admin") ||
      null;
    if (!raw) return null;

    // try parse JSON, fallback to string
    try {
      const parsed = JSON.parse(raw);
      return (
        parsed?.accessToken ??
        parsed?.token ??
        parsed?.access_token ??
        parsed?.adminToken ??
        parsed?.tokenString ??
        null
      );
    } catch {
      // raw might be plain token string
      return raw;
    }
  } catch (e) {
    console.warn("Error reading admin token:", e);
    return null;
  }
};

// Attach token automatically for admin routes
API.interceptors.request.use((config) => {
  try {
    const token = getAdminToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("Interceptor error:", err);
  }
  return config;
});

// ----------------- Admin API calls -----------------

// Admin login (POST /api/admin/login)
export const loginAdmin = async ({ identifier, password }) => {
  try {
    // Note: posting to /admin/login (mounted at /api/admin/login)
    const { data } = await API.post("/admin/login", { identifier, password });
    // Return the raw data object (caller will handle saving)
    return data;
  } catch (err) {
    console.error("Admin login error:", err.response?.data || err.message);
    throw err;
  }
};

// Fetch all users (GET /api/admin/users)
export const fetchUsers = async () => {
  try {
    const { data } = await API.get("/admin/users");
    return data;
  } catch (err) {
    console.error("Error fetching users:", err.response?.data || err.message);
    throw err;
  }
};

// Update user (PUT /api/admin/users/:id)
export const updateUser = async (id, userData) => {
  try {
    const { data } = await API.put(`/admin/users/${id}`, userData);
    return data;
  } catch (err) {
    console.error("Error updating user:", err.response?.data || err.message);
    throw err;
  }
};

// Delete user (DELETE /api/admin/users/:id)
export const deleteUser = async (id) => {
  try {
    const { data } = await API.delete(`/admin/users/${id}`);
    return data;
  } catch (err) {
    console.error("Error deleting user:", err.response?.data || err.message);
    throw err;
  }
};

export default API;
