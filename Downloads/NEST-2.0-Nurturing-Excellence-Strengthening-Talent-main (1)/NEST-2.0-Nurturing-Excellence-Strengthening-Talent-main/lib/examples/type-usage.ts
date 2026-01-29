/**
 * Example usage of the type system
 * This file demonstrates how to use the types and validators
 */

import {
  Role,
  TaskStatus,
  Priority,
  Severity,
  User,
  Case,
  FollowUpTask,
  FollowUpFormTemplate,
  FormField,
  CreateCaseInput,
  CreateFollowUpTaskInput,
} from "@/types";

import {
  validateCreateCase,
  validateCreateFollowUpTask,
  validateStatusTransition,
  validateFieldResponse,
} from "@/lib/validators";

// ============================================================================
// Example 1: Creating and validating a new case
// ============================================================================

export function createNewCase(input: CreateCaseInput): Case | { errors: Record<string, string> } {
  // Validate the input
  const validation = validateCreateCase(input);
  
  if (!validation.valid) {
    return { errors: validation.errors };
  }

  // Create the case (this would normally be done via API)
  const newCase: Case = {
    id: crypto.randomUUID(),
    caseNumber: `CASE-${Date.now()}`,
    ...input,
    status: "OPEN",
    createdById: "current-user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newCase;
}

// Usage
const exampleCase = createNewCase({
  patientInitials: "JD",
  patientAge: 52,
  patientGender: "M",
  productName: "Medication ABC",
  batchNumber: "BATCH-2024-001",
  adverseEvent: "Patient reported dizziness and nausea after taking medication",
  severity: Severity.MODERATE,
  reportedDate: new Date("2024-01-15"),
  reporterName: "Dr. Jane Smith",
  reporterContact: "jane.smith@hospital.com",
});

// ============================================================================
// Example 2: Creating a follow-up task with validation
// ============================================================================

export function assignFollowUpTask(
  taskInput: CreateFollowUpTaskInput
): FollowUpTask | { errors: Record<string, string> } {
  // Validate the input
  const validation = validateCreateFollowUpTask(taskInput);
  
  if (!validation.valid) {
    return { errors: validation.errors };
  }

  // Create the task
  const newTask: FollowUpTask = {
    id: crypto.randomUUID(),
    ...taskInput,
    assignedById: "current-pv-officer-id",
    status: TaskStatus.CREATED,
    reminderCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newTask;
}

// Usage
const exampleTask = assignFollowUpTask({
  caseId: "case-123",
  templateId: "template-456",
  assignedToId: "doctor-789",
  priority: Priority.P1,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  notes: "Please complete this follow-up as soon as possible",
});

// ============================================================================
// Example 3: Validating status transitions
// ============================================================================

export function updateTaskStatus(
  task: FollowUpTask,
  newStatus: TaskStatus
): FollowUpTask | { error: string } {
  // Validate the transition
  const validation = validateStatusTransition(task.status, newStatus);
  
  if (!validation.valid) {
    return { error: validation.error! };
  }

  // Update the task
  const updatedTask: FollowUpTask = {
    ...task,
    status: newStatus,
    updatedAt: new Date(),
  };

  // Set appropriate timestamp based on status
  switch (newStatus) {
    case TaskStatus.SENT:
      updatedTask.sentAt = new Date();
      break;
    case TaskStatus.OPENED:
      updatedTask.openedAt = new Date();
      break;
    case TaskStatus.IN_PROGRESS:
      updatedTask.startedAt = new Date();
      break;
    case TaskStatus.SUBMITTED:
      updatedTask.submittedAt = new Date();
      break;
    case TaskStatus.VALIDATED:
      updatedTask.validatedAt = new Date();
      break;
    case TaskStatus.CLOSED:
      updatedTask.closedAt = new Date();
      break;
  }

  return updatedTask;
}

// ============================================================================
// Example 4: Creating a form template
// ============================================================================

export function createFollowUpTemplate(): FollowUpFormTemplate {
  const fields: Omit<FormField, "id">[] = [
    {
      label: "Patient Current Status",
      type: "select",
      options: ["Improved", "Stable", "Worsened", "Recovered"],
      required: true,
    },
    {
      label: "Current Symptoms",
      type: "textarea",
      required: true,
      placeholder: "Describe current symptoms in detail",
      validation: {
        minLength: 20,
        maxLength: 1000,
      },
    },
    {
      label: "Treatment Given",
      type: "textarea",
      required: false,
      placeholder: "Describe any treatment provided",
    },
    {
      label: "Date of Last Examination",
      type: "date",
      required: true,
    },
    {
      label: "Severity Assessment",
      type: "select",
      options: ["Mild", "Moderate", "Severe"],
      required: true,
    },
    {
      label: "Additional Medications",
      type: "text",
      required: false,
      placeholder: "List any additional medications",
    },
    {
      label: "Follow-up Required",
      type: "radio",
      options: ["Yes", "No"],
      required: true,
    },
  ];

  const template: FollowUpFormTemplate = {
    id: crypto.randomUUID(),
    name: "Standard Adverse Event Follow-up",
    description: "Standard follow-up form for adverse event cases",
    version: 1,
    fields: fields.map((field, index) => ({
      ...field,
      id: `field-${index + 1}`,
    })),
    isActive: true,
    createdById: "admin-user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return template;
}

// ============================================================================
// Example 5: Validating form field responses
// ============================================================================

export function validateFormSubmission(
  template: FollowUpFormTemplate,
  responses: Array<{ fieldId: string; value: unknown }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Check all required fields are present
  template.fields.forEach((field) => {
    const response = responses.find((r) => r.fieldId === field.id);
    
    const validation = validateFieldResponse(
      field.type,
      response?.value,
      field.required,
      field.validation
    );

    if (!validation.valid) {
      errors[field.id] = validation.error!;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Example 6: Type-safe role checking
// ============================================================================

export function canAssignTasks(user: User): boolean {
  return [Role.PV_OFFICER, Role.SAFETY_LEAD, Role.ADMIN].includes(user.role);
}

export function canValidateSubmissions(user: User): boolean {
  return [Role.PV_OFFICER, Role.SAFETY_LEAD, Role.ADMIN].includes(user.role);
}

export function canManageUsers(user: User): boolean {
  return user.role === Role.ADMIN;
}

export function canViewAllCases(user: User): boolean {
  return [Role.PV_OFFICER, Role.SAFETY_LEAD, Role.ADMIN].includes(user.role);
}

// ============================================================================
// Example 7: Filtering tasks with type safety
// ============================================================================

export function getHighPriorityOpenTasks(tasks: FollowUpTask[]): FollowUpTask[] {
  return tasks.filter(
    (task) =>
      (task.priority === Priority.P0 || task.priority === Priority.P1) &&
      ![TaskStatus.CLOSED, TaskStatus.EXPIRED, TaskStatus.VALIDATED].includes(task.status)
  );
}

export function getOverdueTasks(tasks: FollowUpTask[]): FollowUpTask[] {
  const now = new Date();
  return tasks.filter(
    (task) =>
      task.dueDate < now &&
      ![TaskStatus.CLOSED, TaskStatus.SUBMITTED, TaskStatus.VALIDATED].includes(task.status)
  );
}

export function getTasksByDoctor(tasks: FollowUpTask[], doctorId: string): FollowUpTask[] {
  return tasks.filter((task) => task.assignedToId === doctorId);
}
