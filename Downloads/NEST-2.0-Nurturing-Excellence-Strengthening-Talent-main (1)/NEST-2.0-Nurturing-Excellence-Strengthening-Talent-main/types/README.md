# Type System Documentation

## Overview
TypeScript types and validators for the pharmacovigilance follow-up system.

## Enums

### Role
```typescript
enum Role {
  DOCTOR        // Healthcare provider who completes follow-ups
  PV_OFFICER    // Pharmacovigilance officer who manages cases
  SAFETY_LEAD   // Safety team lead with elevated permissions
  ADMIN         // System administrator
}
```

### TaskStatus
```typescript
enum TaskStatus {
  CREATED       // Task created but not yet sent
  SENT          // Task sent to doctor
  OPENED        // Doctor opened the task
  IN_PROGRESS   // Doctor started filling the form
  SUBMITTED     // Doctor submitted the response
  VALIDATED     // PV Officer validated the submission
  CLOSED        // Task completed and closed
  EXPIRED       // Task expired without completion
}
```

### Priority
```typescript
enum Priority {
  P0  // Critical - Requires immediate attention
  P1  // High - Important follow-up
  P2  // Normal - Standard follow-up
}
```

### Severity
```typescript
enum Severity {
  MILD       // Minor adverse event
  MODERATE   // Moderate adverse event
  SEVERE     // Serious adverse event
}
```

## Core Entities

### User
Role-based user with authentication and organization linkage.

**Fields:**
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: Full name
- `role`: User role (Role enum)
- `organizationId`: Optional organization link
- `isActive`: Account status
- Timestamps: `createdAt`, `updatedAt`, `lastLoginAt`

### Case
Adverse event case requiring follow-up.

**Fields:**
- `id`, `caseNumber`: Identifiers
- Patient info: `patientInitials`, `patientAge`, `patientGender`
- Product: `productName`, `batchNumber`
- Event: `adverseEvent`, `severity`
- Reporter: `reporterName`, `reporterContact`
- Assignment: `assignedToId` (PV Officer)
- Status: `OPEN`, `UNDER_REVIEW`, `CLOSED`
- Timestamps: `reportedDate`, `createdAt`, `updatedAt`, `closedAt`

### FollowUpFormTemplate
Reusable form template for follow-up data collection.

**Fields:**
- `id`, `name`, `description`: Basic info
- `version`: Template version
- `fields`: Array of FormField definitions
- `isActive`: Whether template is active
- Timestamps: `createdAt`, `updatedAt`

**FormField Structure:**
- `id`, `label`: Field identifier and display text
- `type`: Field type (text, textarea, number, date, select, radio, checkbox)
- `options`: Options for select/radio/checkbox
- `required`: Whether field is mandatory
- `validation`: Optional validation rules (min/max length, pattern, etc.)

### FollowUpTask
Task assigned to a doctor for case follow-up.

**Fields:**
- `id`: Task identifier
- Links: `caseId`, `templateId`, `assignedToId`, `assignedById`
- `priority`: Task priority (Priority enum)
- `status`: Current status (TaskStatus enum)
- `dueDate`: Deadline for completion
- Status timestamps: `sentAt`, `openedAt`, `startedAt`, `submittedAt`, `validatedAt`, `closedAt`
- `validatedById`: PV Officer who validated
- `notes`: Additional notes
- Reminder: `reminderCount`, `lastReminderAt`

### FollowUpSubmission
Doctor's response to a follow-up task.

**Fields:**
- `id`: Submission identifier
- Links: `taskId`, `caseId`, `submittedById`
- `responses`: Array of field responses (SubmissionResponse[])
- `isDraft`: Whether submission is draft or final
- Validation: `validatedAt`, `validatedById`, `validationNotes`
- Timestamps: `submittedAt`, `createdAt`, `updatedAt`

**SubmissionResponse Structure:**
- `fieldId`: Reference to form field
- `value`: Response value (string, number, boolean, or array)

### AuditLog
Comprehensive audit trail for all system actions.

**Fields:**
- `id`: Log entry identifier
- User: `userId`, `userEmail`, `userName`
- Action: `action` (AuditAction enum), `entityType`, `entityId`
- `changes`: Object tracking old vs new values
- `metadata`: Additional context
- Request: `ipAddress`, `userAgent`
- `timestamp`: When action occurred

## Validators

### Entity Validators

#### validateCreateUser
Validates user creation input.
- Email format and presence
- Name length (2-100 chars)
- Valid role

#### validateCreateCase
Validates case creation input.
- Patient initials (2-10 chars)
- Patient age (0-150)
- Product name presence and length
- Adverse event description (10-1000 chars)
- Valid severity
- Reported date not in future

#### validateCreateFollowUpTask
Validates task creation input.
- Required IDs (case, template, assignee)
- Valid priority
- Due date not in past
- Notes length (max 500 chars)

#### validateCreateSubmission
Validates submission input.
- Task ID presence
- Responses array structure
- Each response has valid fieldId and value
- Non-draft submissions require responses

#### validateFieldResponse
Validates individual field response based on field type and rules.
- Required field validation
- Type-specific validation (text, number, date, etc.)
- Custom validation rules (min/max, pattern)

### Status Transition Validation

#### isValidStatusTransition
Checks if a status transition is allowed.

**Valid Transitions:**
- CREATED → SENT
- SENT → OPENED, EXPIRED
- OPENED → IN_PROGRESS, EXPIRED
- IN_PROGRESS → SUBMITTED, EXPIRED
- SUBMITTED → VALIDATED, IN_PROGRESS (revision)
- VALIDATED → CLOSED
- EXPIRED → CREATED (recreate)
- CLOSED → (none, final state)

#### validateStatusTransition
Validates and provides error messages for status transitions.

### General Validators

- `validateEmail`: Email format validation
- `validatePassword`: Password strength (8+ chars, upper/lower/number)
- `sanitizeInput`: Remove potentially harmful characters
- `validateUUID`: UUID format validation
- `validateDateRange`: Start/end date validation
- `validatePaginationParams`: Page and limit validation (limit: 1-100)

## Usage Examples

```typescript
import {
  Role,
  TaskStatus,
  Priority,
  Severity,
  CreateCaseInput,
  validateCreateCase,
  validateStatusTransition,
} from "@/types";

// Create a case
const caseInput: CreateCaseInput = {
  patientInitials: "AB",
  patientAge: 45,
  patientGender: "F",
  productName: "Product XYZ",
  adverseEvent: "Patient experienced severe headache",
  severity: Severity.MODERATE,
  reportedDate: new Date(),
  reporterName: "Dr. Smith",
};

const validation = validateCreateCase(caseInput);
if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
}

// Validate status transition
const transition = validateStatusTransition(
  TaskStatus.SENT,
  TaskStatus.OPENED
);
if (!transition.valid) {
  console.error("Invalid transition:", transition.error);
}
```

## Helper Types

### PaginationParams
- `page`: Current page number
- `limit`: Items per page

### PaginatedResponse<T>
- `data`: Array of results
- `total`: Total count
- `page`, `limit`: Pagination info
- `totalPages`: Calculated total pages

### TaskFilters
Filtering options for task queries.

### CaseFilters
Filtering options for case queries.
