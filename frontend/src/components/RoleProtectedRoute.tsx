import { JSX } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) {
  const { token, user, loading } = useAuth();

  if (loading) return null; // Or a loader/spinner

  if (!token) return <Navigate to="/" />;
  if (!user || !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" />;

  return children;
}

