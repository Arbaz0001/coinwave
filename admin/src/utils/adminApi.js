// src/utils/adminApi.js
import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// ----------------- TOKEN HELPER -----------------
const getAdminToken = () => {
  const raw = localStorage.getItem("adminAuth");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.accessToken || null;
  } catch {
    return raw;
  }
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
  const { data } = await API.post(
    "/api/admin/login",
    { identifier, password }
  );
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

export default API;
