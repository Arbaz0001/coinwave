import React, { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedAdmin = localStorage.getItem("cw_admin");
        const storedToken = localStorage.getItem("admin_token");

        if (storedAdmin && storedToken) {
          setAdmin({
            token: storedToken,
            user: JSON.parse(storedAdmin),
          });
          console.log("✅ Admin session restored");
        }
      } catch (error) {
        console.error("❌ Failed to restore admin session:", error);
        localStorage.removeItem("cw_admin");
        localStorage.removeItem("admin_token");
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

    setAdmin({ token, user: adminData });

    localStorage.setItem("cw_admin", JSON.stringify(adminData));
    localStorage.setItem("admin_token", token);

    // Clear user session if exists
    localStorage.removeItem("cw_user");
    localStorage.removeItem("user_token");

    console.log("👑 Admin logged in");
  };

  const logout = () => {
    setAdmin({ token: null, user: null });
    localStorage.removeItem("cw_admin");
    localStorage.removeItem("admin_token");
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
