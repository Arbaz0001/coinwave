import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>

          {/* Default when visiting /admin */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login page -> /admin/login */}
          <Route path="/login" element={<AdminLogin />} />

          {/* All other admin routes */}
          <Route path="/*" element={<App />} />

        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  </React.StrictMode>
);
