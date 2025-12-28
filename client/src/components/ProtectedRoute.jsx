import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, accessToken, loading } = useAuth();

  // wait until auth is loaded
  if (loading) return null; // ya spinner

  // redirect if not logged in
  if (!user || !accessToken) return <Navigate to="/login" replace />;

  return children;
}
