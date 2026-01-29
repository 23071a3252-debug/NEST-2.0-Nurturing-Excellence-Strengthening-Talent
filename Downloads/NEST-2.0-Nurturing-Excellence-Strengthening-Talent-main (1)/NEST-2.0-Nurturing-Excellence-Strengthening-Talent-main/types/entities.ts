/**
 * Entity type definitions for the pharmacovigilance follow-up system
 */

import { Role, TaskStatus, Priority, Severity } from "./enums";

// ============================================================================
// User
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  organizationId?: string;
}

// ============================================================================
// Case
// ============================================================================

export interface Case {
  id: string;
  caseNumber: string; // Unique case identifier
  patientInitials: string;
  patientAge?: number;
  patientGender?: "M" | "F" | "O";
  productName: string;
  batchNumber?: string;
  adverseEvent: string;
  severity: Severity;
  reportedDate: Date;
  reporterName: string;
  reporterContact?: string;
  assignedToId?: string; // PV Officer assigned
  status: "OPEN" | "UNDER_REVIEW" | "CLOSED";
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  sourceReportId?: string; // Reference to MongoDB patient report if escalated
  source?: "PATIENT_REPORT" | "DOCTOR_REPORT" | "MANUAL";
}

export interface CreateCaseInput {
  patientInitials: string;
  patientAge?: number;
  patientGender?: "M" | "F" | "O";
  productName: string;
  batchNumber?: string;
  adverseEvent: string;
  severity: Severity;
  reportedDate: Date;
  reporterName: string;
  reporterContact?: string;
}

// ============================================================================
// Follow-Up Form Template
// ============================================================================

export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "radio" | "checkbox";
  options?: string[]; // For select, radio, checkbox
  required: boolean;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FollowUpFormTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  fields: FormField[];
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormTemplateInput {
  name: string;
  description?: string;
  fields: Omit<FormField, "id">[];
}

// ============================================================================
// Follow-Up Task
// ============================================================================

export interface FollowUpTask {
  id: string;
  caseId: string;
  templateId: string;
  assignedToId: string; // Doctor ID
  assignedById: string; // PV Officer who assigned
  priority: Priority;
  status: TaskStatus;
  dueDate: Date;
  sentAt?: Date;
  openedAt?: Date;
  startedAt?: Date;
  submittedAt?: Date;
  validatedAt?: Date;
  closedAt?: Date;
  validatedById?: string;
  notes?: string;
  reminderCount: number;
  lastReminderAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFollowUpTaskInput {
  caseId: string;
  templateId: string;
  assignedToId: string;
  priority: Priority;
  dueDate: Date;
  notes?: string;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
  notes?: string;
}

// ============================================================================
// Follow-Up Submission
// ============================================================================

export interface SubmissionResponse {
  fieldId: string;
  value: string | number | boolean | string[];
}

export interface FollowUpSubmission {
  id: string;
  taskId: string;
  caseId: string;
  submittedById: string; // Doctor ID
  responses: SubmissionResponse[];
  isDraft: boolean;
  submittedAt?: Date;
  validatedAt?: Date;
  validatedById?: string;
  validationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubmissionInput {
  taskId: string;
  responses: SubmissionResponse[];
  isDraft: boolean;
}

export interface ValidateSubmissionInput {
  validationNotes?: string;
  approved: boolean;
}

// ============================================================================
// Audit Log
// ============================================================================

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorRole: Role;
  actionType: 
    | "TASK_CREATED" 
    | "TASK_SENT" 
    | "TASK_OPENED" 
    | "TASK_ASSIGNED" 
    | "FORM_SUBMITTED" 
    | "FORM_DRAFT_SAVED" 
    | "STATUS_UPDATED" 
    | "CASE_CREATED" 
    | "CASE_UPDATED"
    | "PATIENT_REPORT_CREATED"
    | "DOCTOR_REPORT_CREATED"
    | "REPORT_SENT_TO_DOCTOR"
    | "REPORT_OPENED"
    | "DOCTOR_REPLIED_TO_REPORT"
    | "REPORT_ESCALATED_TO_PV"
    | "REPORT_CLOSED";
  entityType: "CASE" | "TASK" | "SUBMISSION" | "USER" | "PATIENT_REPORT";
  entityId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Legacy AuditLog interface (kept for backward compatibility)
export interface LegacyAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VIEW = "VIEW",
  EXPORT = "EXPORT",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  ASSIGN = "ASSIGN",
  SUBMIT = "SUBMIT",
  VALIDATE = "VALIDATE",
  SEND_REMINDER = "SEND_REMINDER",
}

export enum EntityType {
  USER = "USER",
  CASE = "CASE",
  TASK = "TASK",
  SUBMISSION = "SUBMISSION",
  TEMPLATE = "TEMPLATE",
}

export interface CreateAuditLogInput {
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// Related Types for Queries
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  assignedToId?: string;
  caseId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface CaseFilters {
  status?: string[];
  severity?: Severity[];
  assignedToId?: string;
  reportedDateFrom?: Date;
  reportedDateTo?: Date;
  productName?: string;
}
