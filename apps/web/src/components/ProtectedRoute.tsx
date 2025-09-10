import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredFeature?: string;
  requiredCompany?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredFeature,
  requiredCompany,
}: ProtectedRouteProps) {
  const { user, claims, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !claims) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && claims.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check feature requirement
  if (requiredFeature && !claims.features?.[requiredFeature]) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check company access requirement
  if (requiredCompany && !claims.company_ids?.includes(requiredCompany)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
