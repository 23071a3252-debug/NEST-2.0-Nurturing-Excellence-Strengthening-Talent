/**
 * Entity-specific validation functions
 */

import {
  Role,
  TaskStatus,
  Priority,
  Severity,
  CreateUserInput,
  CreateCaseInput,
  CreateFollowUpTaskInput,
  CreateSubmissionInput,
  SubmissionResponse,
} from "@/types";

// ============================================================================
// User Validation
// ============================================================================

export function validateCreateUser(input: CreateUserInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.email || !input.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Invalid email format";
  }

  if (!input.name || !input.name.trim()) {
    errors.name = "Name is required";
  } else if (input.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (input.name.length > 100) {
    errors.name = "Name must not exceed 100 characters";
  }

  if (!Object.values(Role).includes(input.role)) {
    errors.role = "Invalid role";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Case Validation
// ============================================================================

export function validateCreateCase(input: CreateCaseInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.patientInitials || !input.patientInitials.trim()) {
    errors.patientInitials = "Patient initials are required";
  } else if (input.patientInitials.length < 2 || input.patientInitials.length > 10) {
    errors.patientInitials = "Patient initials must be 2-10 characters";
  }

  if (input.patientAge !== undefined) {
    if (input.patientAge < 0 || input.patientAge > 150) {
      errors.patientAge = "Patient age must be between 0 and 150";
    }
  }

  if (input.patientGender && !["M", "F", "O"].includes(input.patientGender)) {
    errors.patientGender = "Invalid gender value";
  }

  if (!input.productName || !input.productName.trim()) {
    errors.productName = "Product name is required";
  } else if (input.productName.length > 200) {
    errors.productName = "Product name must not exceed 200 characters";
  }

  if (!input.adverseEvent || !input.adverseEvent.trim()) {
    errors.adverseEvent = "Adverse event description is required";
  } else if (input.adverseEvent.length < 10) {
    errors.adverseEvent = "Adverse event description must be at least 10 characters";
  } else if (input.adverseEvent.length > 1000) {
    errors.adverseEvent = "Adverse event description must not exceed 1000 characters";
  }

  if (!Object.values(Severity).includes(input.severity)) {
    errors.severity = "Invalid severity value";
  }

  if (!input.reportedDate) {
    errors.reportedDate = "Reported date is required";
  } else if (input.reportedDate > new Date()) {
    errors.reportedDate = "Reported date cannot be in the future";
  }

  if (!input.reporterName || !input.reporterName.trim()) {
    errors.reporterName = "Reporter name is required";
  } else if (input.reporterName.length < 2) {
    errors.reporterName = "Reporter name must be at least 2 characters";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Follow-Up Task Validation
// ============================================================================

export function validateCreateFollowUpTask(input: CreateFollowUpTaskInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.caseId || !input.caseId.trim()) {
    errors.caseId = "Case ID is required";
  }

  if (!input.templateId || !input.templateId.trim()) {
    errors.templateId = "Template ID is required";
  }

  if (!input.assignedToId || !input.assignedToId.trim()) {
    errors.assignedToId = "Assigned doctor ID is required";
  }

  if (!Object.values(Priority).includes(input.priority)) {
    errors.priority = "Invalid priority value";
  }

  if (!input.dueDate) {
    errors.dueDate = "Due date is required";
  } else if (input.dueDate < new Date()) {
    errors.dueDate = "Due date cannot be in the past";
  }

  if (input.notes && input.notes.length > 500) {
    errors.notes = "Notes must not exceed 500 characters";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Submission Validation
// ============================================================================

export function validateCreateSubmission(input: CreateSubmissionInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.taskId || !input.taskId.trim()) {
    errors.taskId = "Task ID is required";
  }

  if (!input.responses || !Array.isArray(input.responses)) {
    errors.responses = "Responses must be an array";
  } else if (input.responses.length === 0 && !input.isDraft) {
    errors.responses = "At least one response is required for final submission";
  } else {
    // Validate each response
    input.responses.forEach((response, index) => {
      if (!response.fieldId || !response.fieldId.trim()) {
        errors[`responses[${index}].fieldId`] = "Field ID is required";
      }
      if (response.value === undefined || response.value === null) {
        errors[`responses[${index}].value`] = "Response value is required";
      }
    });
  }

  if (typeof input.isDraft !== "boolean") {
    errors.isDraft = "isDraft must be a boolean value";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Field Response Validation
// ============================================================================

export function validateFieldResponse(
  fieldType: string,
  value: unknown,
  required: boolean,
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  }
): { valid: boolean; error?: string } {
  // Check required
  if (required && (value === undefined || value === null || value === "")) {
    return { valid: false, error: "This field is required" };
  }

  // If not required and empty, it's valid
  if (!value && !required) {
    return { valid: true };
  }

  // Type-specific validation
  switch (fieldType) {
    case "text":
    case "textarea":
      if (typeof value !== "string") {
        return { valid: false, error: "Must be a text value" };
      }
      if (validation?.minLength && value.length < validation.minLength) {
        return { valid: false, error: `Must be at least ${validation.minLength} characters` };
      }
      if (validation?.maxLength && value.length > validation.maxLength) {
        return { valid: false, error: `Must not exceed ${validation.maxLength} characters` };
      }
      if (validation?.pattern && !new RegExp(validation.pattern).test(value)) {
        return { valid: false, error: "Invalid format" };
      }
      break;

    case "number":
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (typeof numValue !== "number" || isNaN(numValue)) {
        return { valid: false, error: "Must be a number" };
      }
      if (validation?.min !== undefined && numValue < validation.min) {
        return { valid: false, error: `Must be at least ${validation.min}` };
      }
      if (validation?.max !== undefined && numValue > validation.max) {
        return { valid: false, error: `Must not exceed ${validation.max}` };
      }
      break;

    case "date":
      const dateValue = typeof value === "string" ? new Date(value) : value;
      if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
        return { valid: false, error: "Must be a valid date" };
      }
      break;

    case "select":
    case "radio":
      if (typeof value !== "string") {
        return { valid: false, error: "Must select an option" };
      }
      break;

    case "checkbox":
      if (!Array.isArray(value)) {
        return { valid: false, error: "Must be an array of selections" };
      }
      break;

    default:
      break;
  }

  return { valid: true };
}

// ============================================================================
// Status Transition Validation
// ============================================================================

const VALID_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.CREATED]: [TaskStatus.SENT],
  [TaskStatus.SENT]: [TaskStatus.OPENED, TaskStatus.EXPIRED],
  [TaskStatus.OPENED]: [TaskStatus.IN_PROGRESS, TaskStatus.EXPIRED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.SUBMITTED, TaskStatus.EXPIRED],
  [TaskStatus.SUBMITTED]: [TaskStatus.VALIDATED, TaskStatus.IN_PROGRESS],
  [TaskStatus.VALIDATED]: [TaskStatus.CLOSED],
  [TaskStatus.CLOSED]: [],
  [TaskStatus.EXPIRED]: [TaskStatus.CREATED], // Can recreate expired task
};

export function isValidStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

export function validateStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): { valid: boolean; error?: string } {
  if (currentStatus === newStatus) {
    return { valid: false, error: "Status is already set to this value" };
  }

  if (!isValidStatusTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { valid: true };
}
