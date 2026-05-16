import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { Routes } from "@/routes/routes";
import { RoleTypes, type RoleType } from "@/features/user/interfaces/user.interface";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: RoleType[];
  loggedIn?: boolean;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles,
  loggedIn,
  fallbackPath = Routes.auth.sign_in,
}: ProtectedRouteProps) {
  const { isLoggedIn, role } = useAuthStore();

  if (!isLoggedIn && loggedIn === true) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (isLoggedIn && loggedIn === false) {
    return <Navigate to={Routes.dashboard.root} replace />;
  }

  if (requiredRoles && role !== RoleTypes.SUPER_ADMIN && !requiredRoles.includes(role || RoleTypes.USER)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
