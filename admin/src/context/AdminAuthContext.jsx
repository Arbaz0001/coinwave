import React, { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

const decodeJwtPayload = (token) => {
  try {
    const parts = token?.split(".");
    if (!parts || parts.length < 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

const isJwtExpired = (token) => {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
};

const clearAdminStorage = () => {
  localStorage.removeItem("cw_admin");
  localStorage.removeItem("admin_token");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminAuth");
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedAdmin = localStorage.getItem("cw_admin");
        const storedToken = localStorage.getItem("admin_token");

        if (storedAdmin && storedToken) {
          if (isJwtExpired(storedToken)) {
            clearAdminStorage();
            setAdmin({ token: null, user: null });
            setLoading(false);
            return;
          }

          setAdmin({
            token: storedToken,
            user: JSON.parse(storedAdmin),
          });
          console.log("✅ Admin session restored");
        }
      } catch (error) {
        console.error("❌ Failed to restore admin session:", error);
        clearAdminStorage();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (data) => {
    const adminData = data?.admin || data?.user;
    const token = data?.token || data?.accessToken;

    if (!adminData || !token) return;
    if (isJwtExpired(token)) {
      clearAdminStorage();
      setAdmin({ token: null, user: null });
      return;
    }

    setAdmin({ token, user: adminData });

    localStorage.setItem("cw_admin", JSON.stringify(adminData));
    localStorage.setItem("admin_token", token);
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminAuth", JSON.stringify({ accessToken: token, user: adminData }));

    // Clear user session if exists
    localStorage.removeItem("cw_user");
    localStorage.removeItem("user_token");

    console.log("👑 Admin logged in");
  };

  const logout = () => {
    setAdmin({ token: null, user: null });
    clearAdminStorage();
    console.log("🚪 Admin logged out");
  };

  const isLoggedIn = Boolean(admin.token);

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, login, logout, isLoggedIn }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
