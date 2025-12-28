import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const ProtectedRoute = ({ children }) => {
  const { accessToken, loading } = useAdminAuth();

  if (loading) return <p>Loading...</p>;
  if (!accessToken) return <Navigate to="/admin/login" replace />;

  return children;
};

export default ProtectedRoute;
