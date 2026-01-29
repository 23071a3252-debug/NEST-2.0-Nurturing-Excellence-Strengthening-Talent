/**
 * Authentication utilities - Mock implementation for MVP
 */

import { Role } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
}

export interface SessionData {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

const SESSION_KEY = "pharmavigil_session";
const MOCK_OTP = "123456";

// Mock users database
const MOCK_USERS: Record<string, AuthUser> = {
  // Demo users (from README)
  "doctor@demo.com": {
    id: "doc-1",
    email: "doctor@demo.com",
    name: "Dr. Sarah Johnson",
    role: Role.DOCTOR,
  },
  "pv@demo.com": {
    id: "pv-1",
    email: "pv@demo.com",
    name: "Emily Rodriguez",
    role: Role.PV_OFFICER,
  },
  "safety@demo.com": {
    id: "safety-1",
    email: "safety@demo.com",
    name: "Michael Chen",
    role: Role.SAFETY_LEAD,
  },
  "admin@demo.com": {
    id: "admin-1",
    email: "admin@demo.com",
    name: "Admin User",
    role: Role.ADMIN,
  },
  "patient@demo.com": {
    id: "patient-1",
    email: "patient@demo.com",
    name: "John Patient",
    role: Role.PATIENT,
  },
  "doctor2@demo.com": {
    id: "doc-2",
    email: "doctor2@demo.com",
    name: "Dr. Michael Brown",
    role: Role.DOCTOR,
  },
  "doctor3@demo.com": {
    id: "doc-3",
    email: "doctor3@demo.com",
    name: "Dr. Emily Chen",
    role: Role.DOCTOR,
  },
  // Legacy test users (for backward compatibility)
  "doctor@test.com": {
    id: "doc-1",
    email: "doctor@test.com",
    name: "Dr. John Smith",
    role: Role.DOCTOR,
    phone: "+1234567890",
  },
  "+1234567890": {
    id: "doc-1",
    email: "doctor@test.com",
    name: "Dr. John Smith",
    role: Role.DOCTOR,
    phone: "+1234567890",
  },
  "pv@test.com": {
    id: "pv-1",
    email: "pv@test.com",
    name: "Sarah Johnson",
    role: Role.PV_OFFICER,
    phone: "+1987654321",
  },
  "admin@test.com": {
    id: "admin-1",
    email: "admin@test.com",
    name: "Admin User",
    role: Role.ADMIN,
    phone: "+1555555555",
  },
  "safety@test.com": {
    id: "safety-1",
    email: "safety@test.com",
    name: "Michael Chen",
    role: Role.SAFETY_LEAD,
    phone: "+1444444444",
  },
};

/**
 * Request OTP for phone/email
 */
export async function requestOTP(identifier: string): Promise<{
  success: boolean;
  message: string;
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = MOCK_USERS[identifier.toLowerCase()];
  
  if (!user) {
    return {
      success: false,
      message: "User not found. Try: doctor@demo.com, pv@demo.com, safety@demo.com, or admin@demo.com",
    };
  }

  // In production, send OTP via SMS/Email
  console.log(`[MOCK] OTP for ${identifier}: ${MOCK_OTP}`);

  return {
    success: true,
    message: `OTP sent to ${user.email || user.phone}. Use: ${MOCK_OTP}`,
  };
}

/**
 * Verify OTP and create session
 */
export async function verifyOTP(
  identifier: string,
  otp: string
): Promise<{
  success: boolean;
  message: string;
  user?: AuthUser;
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (otp !== MOCK_OTP) {
    return {
      success: false,
      message: "Invalid OTP. Use: 123456",
    };
  }

  const user = MOCK_USERS[identifier.toLowerCase()];
  
  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  // Create session
  const token = generateMockToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const session: SessionData = {
    user,
    token,
    expiresAt,
  };

  // Store in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return {
    success: true,
    message: "Login successful",
    user,
  };
}

/**
 * Get current session
 */
export function getSession(): SessionData | null {
  if (typeof window === "undefined") return null;

  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    const session: SessionData = JSON.parse(sessionStr);

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}

/**
 * Get current user from session
 */
export function getCurrentUser(): AuthUser | null {
  const session = getSession();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Sign out and clear session
 */
export function signOut(): void {
  clearSession();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Clear session from storage
 */
function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Generate a mock session token
 */
function generateMockToken(): string {
  return `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * Update user session (for profile updates, etc.)
 */
export function updateSession(user: Partial<AuthUser>): boolean {
  const session = getSession();
  if (!session) return false;

  const updatedSession: SessionData = {
    ...session,
    user: {
      ...session.user,
      ...user,
    },
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  }

  return true;
}
