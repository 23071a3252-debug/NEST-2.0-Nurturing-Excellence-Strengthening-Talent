/**
 * Validation utilities
 * General validators and entity-specific validators
 */

// Re-export entity validators
export * from "./entities";

// ============================================================================
// General Validation Helpers
// ============================================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateDateRange(startDate: Date, endDate: Date): {
  valid: boolean;
  error?: string;
} {
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return { valid: false, error: "Invalid start date" };
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    return { valid: false, error: "Invalid end date" };
  }
  if (startDate > endDate) {
    return { valid: false, error: "Start date must be before end date" };
  }
  return { valid: true };
}

export function validatePaginationParams(page: number, limit: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isInteger(page) || page < 1) {
    return { valid: false, error: "Page must be a positive integer" };
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { valid: false, error: "Limit must be between 1 and 100" };
  }
  return { valid: true };
}
