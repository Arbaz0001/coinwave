// import React, { createContext, useContext, useState, useEffect } from "react";

// const AdminAuthContext = createContext();

// export const AdminAuthProvider = ({ children }) => {
//   const [admin, setAdmin] = useState({ accessToken: null, user: null });
//   const [loading, setLoading] = useState(true);

//   // Load from localStorage on mount
//   useEffect(() => {
//     const stored = localStorage.getItem("adminAuth");
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         if (parsed.accessToken) setAdmin(parsed);
//       } catch (err) {
//         console.error("Error parsing adminAuth from localStorage:", err);
//       }
//     }
//     setLoading(false);
//   }, []);

//   const login = (data) => {
//   setAdmin(data);
//   localStorage.setItem("adminAuth", JSON.stringify(data));
//   // Optional: localStorage.setItem("adminAuthToken", data.accessToken);
// };


//   const logout = () => {
//     setAdmin({ accessToken: null, user: null });
//     localStorage.removeItem("adminAuth");
//   };

//   const isLoggedIn = !!admin.accessToken;

//   return (
//     <AdminAuthContext.Provider
//       value={{ admin, loading, login, logout, isLoggedIn }}
//     >
//       {children}
//     </AdminAuthContext.Provider>
//   );
// };

// // Custom hook
// export const useAdminAuth = () => useContext(AdminAuthContext);


import React, { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(true);

  // ✅ Load admin data from localStorage
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("cw_admin");
      const storedToken = localStorage.getItem("admin_token");

      if (storedAdmin && storedToken) {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdmin({ token: storedToken, user: parsedAdmin });
        console.log("✅ Admin session restored:", parsedAdmin);
      } else {
        console.log("⚠️ No active admin session found.");
      }
    } catch (err) {
      console.error("❌ Error loading admin session:", err);
      localStorage.removeItem("cw_admin");
      localStorage.removeItem("admin_token");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Login function
  const login = (data) => {
    try {
      const adminData = data?.admin || data?.user || null;
      const token = data?.token || data?.accessToken;

      if (!adminData || !token) {
        console.warn("⚠️ Invalid admin login data:", data);
        return;
      }

      // Save in state and localStorage
      setAdmin({ token, user: adminData });
      localStorage.setItem("cw_admin", JSON.stringify(adminData));
      localStorage.setItem("admin_token", token);

      // Clear any user session to avoid conflict
      if (localStorage.getItem("cw_user")) {
        localStorage.removeItem("cw_user");
        localStorage.removeItem("user_token");
        console.log("🧹 Cleared user data after admin login");
      }

      console.log("👑 Admin logged in:", adminData);
    } catch (err) {
      console.error("❌ Error during admin login:", err);
    }
  };

  // ✅ Logout function
  const logout = () => {
    setAdmin({ token: null, user: null });
    localStorage.removeItem("cw_admin");
    localStorage.removeItem("admin_token");
    console.log("🚪 Admin logged out successfully.");
  };

  // ✅ Check if logged in
  const isLoggedIn = !!admin.token;

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, isLoggedIn }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// ✅ Custom Hook (This fixes your import error)
export const useAdminAuth = () => useContext(AdminAuthContext);

