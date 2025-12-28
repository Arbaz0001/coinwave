import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { BalanceProvider } from "./context/BalanceContext";
import { NotificationProvider } from "./context/NotificationContext"; // ✅ add this
import { ToastContainer } from "react-toastify"; // ✅ add this
import "react-toastify/dist/ReactToastify.css"; // ✅ add toast styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BalanceProvider>
          <NotificationProvider>
            <App />
            {/* ✅ Toast popup container (works anywhere in app) */}
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              theme="dark"
            />
          </NotificationProvider>
        </BalanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
