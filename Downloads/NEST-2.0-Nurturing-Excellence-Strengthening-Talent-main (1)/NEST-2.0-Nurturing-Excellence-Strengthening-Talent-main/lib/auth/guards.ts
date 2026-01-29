/**
 * Auth guard utilities for protecting routes
 */

import { Role } from "@/types";
import { getCurrentUser } from "./session";

export interface AuthGuardConfig {
  allowedRoles?: Role[];
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if current user can access a route
 */
export function canAccessRoute(allowedRoles?: Role[]): {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
} {
  const user = getCurrentUser();

  // No auth required
  if (!allowedRoles || allowedRoles.length === 0) {
    return { allowed: true };
  }

  // Auth required but not logged in
  if (!user) {
    return {
      allowed: false,
      reason: "Authentication required",
      redirectTo: "/login",
    };
  }

  // Check role
  if (!hasRole(user.role, allowedRoles)) {
    return {
      allowed: false,
      reason: "Insufficient permissions",
      redirectTo: "/",
    };
  }

  return { allowed: true };
}

/**
 * Get route configuration by path
 */
export function getRouteGuard(path: string): AuthGuardConfig {
  // Public routes
  if (path === "/" || path === "/login" || path === "/verify-otp") {
    return { requireAuth: false };
  }

  // Doctor routes
  if (path.startsWith("/doctor")) {
    return {
      requireAuth: true,
      allowedRoles: [Role.DOCTOR],
      redirectTo: "/login",
    };
  }

  // PV routes
  if (path.startsWith("/pv")) {
    return {
      requireAuth: true,
      allowedRoles: [Role.PV_OFFICER, Role.SAFETY_LEAD],
      redirectTo: "/login",
    };
  }

  // Admin routes
  if (path.startsWith("/admin")) {
    return {
      requireAuth: true,
      allowedRoles: [Role.ADMIN],
      redirectTo: "/login",
    };
  }

  // Auth routes (should redirect if already logged in)
  if (path.startsWith("/auth")) {
    return { requireAuth: false };
  }

  // Default: require authentication
  return { requireAuth: true, redirectTo: "/login" };
}

/**
 * Role-based permissions
 */
export const Permissions = {
  canManageCases: (role: Role) =>
    [Role.PV_OFFICER, Role.SAFETY_LEAD, Role.ADMIN].includes(role),
  
  canAssignTasks: (role: Role) =>
    [Role.PV_OFFICER, Role.SAFETY_LEAD, Role.ADMIN].includes(role),
  
  canValidateSubmissions: (role: Role) =>
    [Role.PV_OFFICER, Role.SAFETY_LEAD, Role.ADMIN].includes(role),
  
  canManageUsers: (role: Role) =>
    role === Role.ADMIN,
  
  canViewAllCases: (role: Role) =>
    [Role.PV_OFFICER, Role.SAFETY_LEAD, Role.ADMIN].includes(role),
  
  canCompleteFollowUps: (role: Role) =>
    role === Role.DOCTOR,
  
  canViewAuditLogs: (role: Role) =>
    [Role.SAFETY_LEAD, Role.ADMIN].includes(role),
};
