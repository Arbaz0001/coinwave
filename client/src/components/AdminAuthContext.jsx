import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
    refreshToken: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("adminAuth"));
    if (stored?.accessToken) setAuth(stored);
    setLoading(false);
  }, []);

  const login = async (data) => {
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, data);
      const { accessToken, refreshToken, user } = res.data;

      if (user.role !== "admin") throw new Error("Unauthorized: Not an admin");

      const newAuth = { user, accessToken, refreshToken };
      setAuth(newAuth);
      localStorage.setItem("adminAuth", JSON.stringify(newAuth));
      console.log("✅ Admin logged in:", newAuth);
      return true;
    } catch (err) {
      console.error("Admin login error:", err.response?.data || err.message);
      throw err;
    }
  };

  const logout = () => {
    setAuth({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem("adminAuth");
  };

  return (
    <AdminAuthContext.Provider value={{ ...auth, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
