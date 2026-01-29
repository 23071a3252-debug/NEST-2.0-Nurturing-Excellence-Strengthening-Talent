/**
 * System-wide enums for the pharmacovigilance follow-up system
 */

export enum Role {
  DOCTOR = "DOCTOR",
  PV_OFFICER = "PV_OFFICER",
  SAFETY_LEAD = "SAFETY_LEAD",
  ADMIN = "ADMIN",
  PATIENT = "PATIENT",
}

export enum TaskStatus {
  CREATED = "CREATED",
  SENT = "SENT",
  OPENED = "OPENED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  VALIDATED = "VALIDATED",
  CLOSED = "CLOSED",
  EXPIRED = "EXPIRED",
}

export enum Priority {
  P0 = "P0", // Critical
  P1 = "P1", // High
  P2 = "P2", // Normal
}

export enum Severity {
  MILD = "MILD",
  MODERATE = "MODERATE",
  SEVERE = "SEVERE",
}
