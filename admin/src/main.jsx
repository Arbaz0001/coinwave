import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import { initSocket } from "./hooks/useSocket";
import "react-toastify/dist/ReactToastify.css";

function AdminSocketInitializer() {
  const { admin } = useAdminAuth();

  React.useEffect(() => {
    if (!admin) return;
    const token = localStorage.getItem("admin_token") || localStorage.getItem("adminToken");
    const socket = initSocket(token);
    if (!socket) return;

    const handler = (data) => {
      console.log("[admin] newSell event:", data);
      toast.success(`New Sell: ${data.userId?.fullName || data.userId?.email} - ${data.amount} ${data.network}`);
    };

    socket.on("newSell", handler);
    return () => socket.off("newSell", handler);
  }, [admin]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
      <AdminSocketInitializer />
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover theme="dark" />
    </AdminAuthProvider>
  </React.StrictMode>
);

