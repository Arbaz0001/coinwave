import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
    refreshToken: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      if (parsed?.accessToken && !isTokenExpired(parsed.accessToken)) {
        setAuth(parsed);
      } else {
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const login = async (data) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, data);
      const { accessToken, refreshToken, user } = res.data;

      const newAuth = { user, accessToken, refreshToken };
      setAuth(newAuth);

      // ✅ Save for global + Deposit.jsx compatibility
      localStorage.setItem("auth", JSON.stringify(newAuth));
      localStorage.setItem("cw_user", JSON.stringify(user));
      localStorage.setItem("user_token", accessToken);

      console.log("✅ User stored successfully:", user);
      return newAuth;
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  const logout = () => {
    setAuth({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem("auth");
    localStorage.removeItem("cw_user");
    localStorage.removeItem("user_token");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
