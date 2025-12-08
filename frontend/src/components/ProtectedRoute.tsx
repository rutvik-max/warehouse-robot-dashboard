// protected code
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
