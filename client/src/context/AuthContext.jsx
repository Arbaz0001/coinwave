import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_CONFIG } from "../config/api.config";

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
    const res = await axios.post(
      `${API_CONFIG.API_BASE}/auth/login`,
      data
    );

    const { accessToken, refreshToken, user } = res.data;

    const newAuth = { user, accessToken, refreshToken };
    setAuth(newAuth);

    // Store all tokens consistently
    localStorage.setItem("auth", JSON.stringify(newAuth));
    localStorage.setItem("cw_user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken); // Primary token for interceptor
    localStorage.setItem("refreshToken", refreshToken); // For token refresh
    localStorage.setItem("user_token", accessToken); // Legacy support

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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();
    globalThis.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
