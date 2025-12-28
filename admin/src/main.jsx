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
      <BrowserRouter>
        <Routes>
          {/* Default redirect when visiting "/" */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          {/* Admin login page */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin dashboard & all other admin routes */}
          <Route path="/admin/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  </React.StrictMode>
);
