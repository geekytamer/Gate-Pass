import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { token, loading } = useAuth();

  if (loading) return null; // or <Loader /> if you want

  return token ? children : <Navigate to="/" />;
}
