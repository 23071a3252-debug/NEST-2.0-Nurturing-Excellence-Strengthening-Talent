/**
 * Mock data for MVP development
 * This will be replaced with API calls in production
 */

import {
  Case,
  FollowUpTask,
  FollowUpFormTemplate,
  FollowUpSubmission,
  AuditLog,
  TaskStatus,
  Priority,
  Severity,
  FormField,
  Role,
  PatientProblemReport,
  CreatePatientReportInput,
  DoctorReplyInput,
} from "@/types";

// Mock Cases
export const mockCases: Case[] = [
  {
    id: "case-001",
    caseNumber: "CASE-2024-001",
    patientInitials: "JD",
    patientAge: 52,
    patientGender: "M",
    productName: "Cardio-XR 500mg",
    batchNumber: "BATCH-2024-A123",
    adverseEvent: "Patient reported severe dizziness and nausea within 2 hours of taking medication",
    severity: Severity.MODERATE,
    reportedDate: new Date("2024-01-10"),
    reporterName: "Dr. Sarah Johnson",
    reporterContact: "sarah.j@hospital.com",
    assignedToId: "pv-1",
    status: "UNDER_REVIEW",
    createdById: "pv-1",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "case-002",
    caseNumber: "CASE-2024-002",
    patientInitials: "MK",
    patientAge: 34,
    patientGender: "F",
    productName: "Allergen-B Injection",
    batchNumber: "BATCH-2023-Z890",
    adverseEvent: "Mild skin rash and itching at injection site, appeared after 24 hours",
    severity: Severity.MILD,
    reportedDate: new Date("2024-01-12"),
    reporterName: "Dr. Michael Chen",
    reporterContact: "m.chen@clinic.com",
    assignedToId: "pv-1",
    status: "OPEN",
    createdById: "pv-1",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "case-003",
    caseNumber: "CASE-2024-003",
    patientInitials: "AB",
    patientAge: 67,
    patientGender: "M",
    productName: "NeuroCalm 100mg",
    batchNumber: "BATCH-2024-C456",
    adverseEvent: "Severe headache, confusion, and difficulty breathing. Required emergency intervention",
    severity: Severity.SEVERE,
    reportedDate: new Date("2024-01-08"),
    reporterName: "Dr. Emily Rodriguez",
    reporterContact: "e.rodriguez@hospital.com",
    assignedToId: "pv-1",
    status: "UNDER_REVIEW",
    createdById: "pv-1",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-20"),
  },
];

// Mock Form Template
export const mockFormTemplate: FollowUpFormTemplate = {
  id: "template-001",
  name: "Standard Adverse Event Follow-up",
  description: "Standard follow-up form for adverse event cases",
  version: 1,
  fields: [
    {
      id: "field-001",
      label: "Drug Name",
      type: "text",
      required: true,
      placeholder: "Product name",
    },
    {
      id: "field-002",
      label: "Dose",
      type: "text",
      required: true,
      placeholder: "e.g., 500mg",
      validation: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      id: "field-003",
      label: "Duration of Use",
      type: "text",
      required: true,
      placeholder: "e.g., 7 days, 2 weeks",
      validation: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      id: "field-004",
      label: "Side Effect Start Time",
      type: "text",
      required: true,
      placeholder: "e.g., 2 hours after first dose, day 3 of treatment",
      validation: {
        minLength: 5,
        maxLength: 200,
      },
    },
    {
      id: "field-005",
      label: "Severity",
      type: "select",
      options: ["Mild", "Moderate", "Severe"],
      required: true,
    },
    {
      id: "field-006",
      label: "Treatment Provided",
      type: "textarea",
      required: true,
      placeholder: "Describe the treatment given for the adverse event",
      validation: {
        minLength: 10,
        maxLength: 1000,
      },
    },
    {
      id: "field-007",
      label: "Current Patient Condition",
      type: "select",
      options: ["Recovered", "Recovering", "Not Improved", "Worsened", "Unknown"],
      required: true,
    },
    {
      id: "field-008",
      label: "Additional Notes",
      type: "textarea",
      required: false,
      placeholder: "Any additional observations or comments",
      validation: {
        maxLength: 1000,
      },
    },
  ],
  isActive: true,
  createdById: "admin-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Mock Follow-Up Tasks
export const mockTasks: FollowUpTask[] = [
  {
    id: "task-001",
    caseId: "case-001",
    templateId: "template-001",
    assignedToId: "doc-1",
    assignedById: "pv-1",
    priority: Priority.P1,
    status: TaskStatus.SENT,
    dueDate: new Date("2024-01-25"),
    sentAt: new Date("2024-01-15"),
    notes: "Please complete this follow-up within 48 hours. Patient requires urgent assessment.",
    reminderCount: 1,
    lastReminderAt: new Date("2024-01-20"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "task-002",
    caseId: "case-002",
    templateId: "template-001",
    assignedToId: "doc-1",
    assignedById: "pv-1",
    priority: Priority.P2,
    status: TaskStatus.OPENED,
    dueDate: new Date("2024-01-28"),
    sentAt: new Date("2024-01-16"),
    openedAt: new Date("2024-01-18"),
    notes: "Routine follow-up for mild adverse event.",
    reminderCount: 0,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "task-003",
    caseId: "case-003",
    templateId: "template-001",
    assignedToId: "doc-1",
    assignedById: "pv-1",
    priority: Priority.P0,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date("2024-01-23"),
    sentAt: new Date("2024-01-14"),
    openedAt: new Date("2024-01-15"),
    startedAt: new Date("2024-01-21"),
    notes: "URGENT: Severe adverse event. Immediate follow-up required.",
    reminderCount: 2,
    lastReminderAt: new Date("2024-01-21"),
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-21"),
  },
];

// Mock Submissions
export const mockSubmissions: FollowUpSubmission[] = [];

// Helper functions for mock data management
let tasks = [...mockTasks];
let submissions = [...mockSubmissions];
let auditLogs: AuditLog[] = [];

// Initialize audit logs for existing mock tasks
function initializeAuditLogs() {
  // Task 1 - SENT status
  auditLogs.push({
    id: "audit-init-001",
    actorUserId: "pv-1",
    actorRole: Role.PV_OFFICER,
    actionType: "TASK_CREATED",
    entityType: "TASK",
    entityId: "task-001",
    timestamp: new Date("2024-01-20"),
    metadata: {
      caseId: "case-001",
      assignedToId: "doc-1",
      priority: Priority.P1,
      notes: "Follow up on dizziness symptoms reported after Cardio-XR administration.",
    },
  });

  auditLogs.push({
    id: "audit-init-001b",
    actorUserId: "pv-1",
    actorRole: Role.PV_OFFICER,
    actionType: "TASK_SENT",
    entityType: "TASK",
    entityId: "task-001",
    timestamp: new Date("2024-01-20T00:01:00"),
    metadata: {
      caseId: "case-001",
      assignedToId: "doc-1",
      doctorNotified: true,
      sentAt: new Date("2024-01-20").toISOString(),
    },
  });

  // Task 2 - OPENED status
  auditLogs.push({
    id: "audit-init-002",
    actorUserId: "pv-1",
    actorRole: Role.PV_OFFICER,
    actionType: "TASK_CREATED",
    entityType: "TASK",
    entityId: "task-002",
    timestamp: new Date("2024-01-15"),
    metadata: {
      caseId: "case-002",
      assignedToId: "doc-1",
      priority: Priority.P2,
      notes: "Patient reported rash following Allergen-B use. Collect additional details.",
    },
  });
  
  auditLogs.push({
    id: "audit-init-002b",
    actorUserId: "pv-1",
    actorRole: Role.PV_OFFICER,
    actionType: "TASK_SENT",
    entityType: "TASK",
    entityId: "task-002",
    timestamp: new Date("2024-01-15T00:01:00"),
    metadata: {
      caseId: "case-002",
      assignedToId: "doc-1",
      doctorNotified: true,
      sentAt: new Date("2024-01-15").toISOString(),
    },
  });
  
  auditLogs.push({
    id: "audit-init-003",
    actorUserId: "doc-1",
    actorRole: Role.DOCTOR,
    actionType: "TASK_OPENED",
    entityType: "TASK",
    entityId: "task-002",
    timestamp: new Date("2024-01-16"),
    metadata: {
      previousStatus: TaskStatus.SENT,
      newStatus: TaskStatus.OPENED,
      caseId: "case-002",
    },
  });

  // Task 3 - IN_PROGRESS status (with full history)
  auditLogs.push({
    id: "audit-init-004",
    actorUserId: "pv-1",
    actorRole: Role.PV_OFFICER,
    actionType: "TASK_CREATED",
    entityType: "TASK",
    entityId: "task-003",
    timestamp: new Date("2024-01-14"),
    metadata: {
      caseId: "case-003",
      assignedToId: "doc-1",
      priority: Priority.P0,
      notes: "URGENT: Severe adverse event. Immediate follow-up required.",
    },
  });

  auditLogs.push({
    id: "audit-init-004b",
    actorUserId: "pv-1",
    actorRole: Role.PV_OFFICER,
    actionType: "TASK_SENT",
    entityType: "TASK",
    entityId: "task-003",
    timestamp: new Date("2024-01-14T00:01:00"),
    metadata: {
      caseId: "case-003",
      assignedToId: "doc-1",
      doctorNotified: true,
      sentAt: new Date("2024-01-14").toISOString(),
    },
  });

  auditLogs.push({
    id: "audit-init-005",
    actorUserId: "doc-1",
    actorRole: Role.DOCTOR,
    actionType: "TASK_OPENED",
    entityType: "TASK",
    entityId: "task-003",
    timestamp: new Date("2024-01-15"),
    metadata: {
      previousStatus: TaskStatus.SENT,
      newStatus: TaskStatus.OPENED,
      caseId: "case-003",
    },
  });

  auditLogs.push({
    id: "audit-init-006",
    actorUserId: "doc-1",
    actorRole: Role.DOCTOR,
    actionType: "STATUS_UPDATED",
    entityType: "TASK",
    entityId: "task-003",
    timestamp: new Date("2024-01-21"),
    metadata: {
      previousStatus: TaskStatus.OPENED,
      newStatus: TaskStatus.IN_PROGRESS,
      caseId: "case-003",
    },
  });
}

// Initialize on load
initializeAuditLogs();

export function getAllTasks(): FollowUpTask[] {
  return [...tasks];
}

export function getTaskById(taskId: string): FollowUpTask | undefined {
  return tasks.find((t) => t.id === taskId);
}

export function getTasksByDoctorId(doctorId: string): FollowUpTask[] {
  return tasks.filter((t) => t.assignedToId === doctorId);
}

export function getCaseById(caseId: string): Case | undefined {
  return mockCases.find((c) => c.id === caseId);
}

export function getFormTemplate(): FollowUpFormTemplate {
  return mockFormTemplate;
}

export function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  updates?: Partial<FollowUpTask>,
  actorUserId?: string,
  actorRole?: Role
): FollowUpTask | null {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return null;

  const previousStatus = tasks[taskIndex].status;
  const updatedTask = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date(),
    ...updates,
  };

  tasks[taskIndex] = updatedTask;

  // Create audit log for status change
  if (actorUserId && actorRole) {
    if (status === TaskStatus.OPENED && previousStatus === TaskStatus.SENT) {
      createAuditLog(
        actorUserId,
        actorRole,
        "TASK_OPENED",
        "TASK",
        taskId,
        {
          previousStatus,
          newStatus: status,
          caseId: updatedTask.caseId,
        }
      );
    } else if (previousStatus !== status) {
      createAuditLog(
        actorUserId,
        actorRole,
        "STATUS_UPDATED",
        "TASK",
        taskId,
        {
          previousStatus,
          newStatus: status,
          caseId: updatedTask.caseId,
        }
      );
    }
  }

  return updatedTask;
}

export function createSubmission(
  taskId: string,
  responses: FollowUpSubmission["responses"],
  isDraft: boolean,
  submittedById: string
): FollowUpSubmission {
  const task = getTaskById(taskId);
  if (!task) throw new Error("Task not found");

  const submission: FollowUpSubmission = {
    id: `submission-${Date.now()}`,
    taskId,
    caseId: task.caseId,
    submittedById,
    responses,
    isDraft,
    submittedAt: isDraft ? undefined : new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  submissions.push(submission);

  // Update task status
  if (!isDraft) {
    updateTaskStatus(taskId, TaskStatus.SUBMITTED, {
      submittedAt: new Date(),
    }, submittedById, Role.DOCTOR);

    // Extract key answer data for audit log
    const keyAnswers: Record<string, string> = {};
    responses.forEach((response) => {
      // Convert all response values to strings for audit log
      const value = Array.isArray(response.value) 
        ? response.value.join(", ") 
        : String(response.value);
      keyAnswers[response.fieldId] = value;
    });

    // Create audit log for form submission with key answers
    createAuditLog(
      submittedById,
      Role.DOCTOR,
      "FORM_SUBMITTED",
      "SUBMISSION",
      submission.id,
      {
        taskId,
        caseId: task.caseId,
        responseCount: responses.length,
        keyAnswers,
        submittedAt: submission.submittedAt?.toISOString(),
      }
    );
  } else {
    updateTaskStatus(taskId, TaskStatus.IN_PROGRESS, {
      startedAt: task.startedAt || new Date(),
    }, submittedById, Role.DOCTOR);

    // Create audit log for draft save
    createAuditLog(
      submittedById,
      Role.DOCTOR,
      "FORM_DRAFT_SAVED",
      "SUBMISSION",
      submission.id,
      {
        taskId,
        caseId: task.caseId,
        responseCount: Object.keys(responses).length,
      }
    );
  }

  return submission;
}

export function getSubmissionByTaskId(taskId: string): FollowUpSubmission | undefined {
  return submissions.find((s) => s.taskId === taskId);
}

// Get all cases
export function getAllCases(): Case[] {
  return [...mockCases];
}

// Get tasks by case ID
export function getTasksByCaseId(caseId: string): FollowUpTask[] {
  return tasks.filter((t) => t.caseId === caseId);
}

// Calculate case completeness score (0-100)
export function getCaseCompleteness(caseId: string): number {
  const caseTasks = getTasksByCaseId(caseId);
  if (caseTasks.length === 0) return 0;

  const completedTasks = caseTasks.filter(
    (t) => [TaskStatus.SUBMITTED, TaskStatus.VALIDATED, TaskStatus.CLOSED].includes(t.status)
  ).length;

  return Math.round((completedTasks / caseTasks.length) * 100);
}

// Get follow-up status for a case
export function getCaseFollowUpStatus(caseId: string): string {
  const caseTasks = getTasksByCaseId(caseId);
  
  if (caseTasks.length === 0) return "No Follow-Up";
  
  const hasSubmitted = caseTasks.some((t) => 
    [TaskStatus.SUBMITTED, TaskStatus.VALIDATED, TaskStatus.CLOSED].includes(t.status)
  );
  const hasInProgress = caseTasks.some((t) => 
    [TaskStatus.IN_PROGRESS, TaskStatus.OPENED].includes(t.status)
  );
  const hasPending = caseTasks.some((t) => t.status === TaskStatus.SENT);
  
  if (hasSubmitted) return "Completed";
  if (hasInProgress) return "In Progress";
  if (hasPending) return "Pending";
  
  return "Unknown";
}

// Create a new follow-up task
export function createFollowUpTask(
  caseId: string,
  assignedToId: string,
  assignedById: string,
  priority: Priority,
  dueDate: Date,
  notes?: string
): FollowUpTask {
  const newTask: FollowUpTask = {
    id: `task-${Date.now()}`,
    caseId,
    templateId: mockFormTemplate.id,
    assignedToId,
    assignedById,
    priority,
    status: TaskStatus.SENT,
    dueDate,
    sentAt: new Date(),
    notes,
    reminderCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tasks.push(newTask);

  // Create audit log for task creation
  createAuditLog(
    assignedById,
    Role.PV_OFFICER,
    "TASK_CREATED",
    "TASK",
    newTask.id,
    {
      caseId,
      assignedToId,
      priority,
      dueDate: dueDate.toISOString(),
      notes,
    }
  );

  // Create audit log for task being sent to doctor
  createAuditLog(
    assignedById,
    Role.PV_OFFICER,
    "TASK_SENT",
    "TASK",
    newTask.id,
    {
      caseId,
      assignedToId,
      doctorNotified: true,
      sentAt: newTask.sentAt?.toISOString(),
    }
  );

  return newTask;
}

// Get available doctors for assignment (mock)
export function getAvailableDoctors(): Array<{ id: string; name: string; email: string }> {
  return [
    { id: "doc-1", name: "Dr. Sarah Johnson", email: "doctor@demo.com" },
    { id: "doc-2", name: "Dr. Michael Brown", email: "doctor2@demo.com" },
    { id: "doc-3", name: "Dr. Emily Chen", email: "doctor3@demo.com" },
  ];
}

// Update case status
export function updateCaseStatus(
  caseId: string,
  status: "OPEN" | "UNDER_REVIEW" | "CLOSED"
): Case | null {
  const caseIndex = mockCases.findIndex((c) => c.id === caseId);
  if (caseIndex === -1) return null;

  const updatedCase = {
    ...mockCases[caseIndex],
    status,
    updatedAt: new Date(),
    closedAt: status === "CLOSED" ? new Date() : undefined,
  };

  mockCases[caseIndex] = updatedCase;
  return updatedCase;
}

// Reset mock data (useful for testing)
export function resetMockData(): void {
  tasks = [...mockTasks];
  submissions = [];
  auditLogs = [];
  patientReports = []; // Clear patient reports
  
  // Clear all localStorage keys (session + drafts + patient reports)
  if (typeof window !== "undefined") {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Clear session key
      if (key === "pharmavigil_session") {
        keysToRemove.push(key);
      }
      // Clear patient reports storage
      if (key === PATIENT_REPORTS_KEY) {
        keysToRemove.push(key);
      }
      // Clear all draft keys (follow-up-draft-*, draft_task_*, patient-report-draft*)
      if (key?.startsWith("follow-up-draft-") || 
          key?.startsWith("draft_task_") ||
          key?.startsWith("patient-report-draft")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  // Reinitialize audit logs
  initializeAuditLogs();
}

// ==============================================================================
// Audit Log Functions
// ==============================================================================

/**
 * Create an audit log entry
 */
export function createAuditLog(
  actorUserId: string,
  actorRole: Role,
  actionType: AuditLog["actionType"],
  entityType: AuditLog["entityType"],
  entityId: string,
  metadata?: Record<string, any>
): AuditLog {
  const auditLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    actorUserId,
    actorRole,
    actionType,
    entityType,
    entityId,
    timestamp: new Date(),
    metadata,
  };

  auditLogs.push(auditLog);
  return auditLog;
}

/**
 * Get audit logs by entity (e.g., all logs for a specific case)
 */
export function getAuditLogsByEntity(
  entityType: "CASE" | "TASK" | "SUBMISSION" | "USER",
  entityId: string
): AuditLog[] {
  return auditLogs
    .filter((log) => log.entityType === entityType && log.entityId === entityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get audit logs for a case and all its related tasks
 */
export function getAuditLogsByCase(caseId: string): AuditLog[] {
  const caseLogs = getAuditLogsByEntity("CASE", caseId);
  const caseTasks = getTasksByCaseId(caseId);
  const taskLogs = caseTasks.flatMap((task) => getAuditLogsByEntity("TASK", task.id));
  const taskIds = caseTasks.map((t) => t.id);
  const submissionLogs = submissions
    .filter((s) => taskIds.includes(s.taskId))
    .flatMap((s) => getAuditLogsByEntity("SUBMISSION", s.id));

  return [...caseLogs, ...taskLogs, ...submissionLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get all audit logs (for admin view)
 */
export function getAllAuditLogs(): AuditLog[] {
  return [...auditLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ==============================================================================
// Patient Problem Report Functions
// ==============================================================================

// Mock patient reports store
const PATIENT_REPORTS_KEY = "pharmavigil_patient_reports";

// Load patient reports from localStorage
function loadPatientReports(): PatientProblemReport[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PATIENT_REPORTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        doctorReply: r.doctorReply ? {
          ...r.doctorReply,
          repliedAt: new Date(r.doctorReply.repliedAt),
        } : undefined,
      }));
    }
  } catch (e) {
    console.error("Failed to load patient reports:", e);
  }
  return [];
}

// Save patient reports to localStorage
function savePatientReports() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PATIENT_REPORTS_KEY, JSON.stringify(patientReports));
  } catch (e) {
    console.error("Failed to save patient reports:", e);
  }
}

let patientReports: PatientProblemReport[] = loadPatientReports();

/**
 * Create a patient-reported problem
 */
export function createPatientReport(
  input: CreatePatientReportInput,
  patientUserId: string
): PatientProblemReport {
  const report: PatientProblemReport = {
    id: `report-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdByRole: "PATIENT",
    createdByUserId: patientUserId,
    linkedDoctorId: input.linkedDoctorId,
    status: "SENT_TO_DOCTOR",
    patientInfo: input.patientInfo,
    questionnaire: input.questionnaire,
  };

  patientReports.push(report);
  savePatientReports();

  // Create audit logs
  createAuditLog(
    patientUserId,
    Role.PATIENT,
    "PATIENT_REPORT_CREATED",
    "PATIENT_REPORT",
    report.id,
    {
      linkedDoctorId: input.linkedDoctorId,
      severity: input.questionnaire.severity,
    }
  );

  createAuditLog(
    patientUserId,
    Role.PATIENT,
    "REPORT_SENT_TO_DOCTOR",
    "PATIENT_REPORT",
    report.id,
    {
      linkedDoctorId: input.linkedDoctorId,
      sentAt: report.createdAt.toISOString(),
    }
  );

  return report;
}

/**
 * Create a doctor-reported patient problem
 */
export function createDoctorReportedPatientProblem(
  input: CreatePatientReportInput,
  doctorUserId: string
): PatientProblemReport {
  const report: PatientProblemReport = {
    id: `report-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdByRole: "DOCTOR",
    createdByUserId: doctorUserId,
    linkedDoctorId: doctorUserId, // Doctor-created uses own id
    status: "SENT_TO_DOCTOR",
    patientInfo: input.patientInfo,
    questionnaire: input.questionnaire,
  };

  patientReports.push(report);
  savePatientReports();

  // Create audit logs
  createAuditLog(
    doctorUserId,
    Role.DOCTOR,
    "DOCTOR_REPORT_CREATED",
    "PATIENT_REPORT",
    report.id,
    {
      severity: input.questionnaire.severity,
    }
  );

  createAuditLog(
    doctorUserId,
    Role.DOCTOR,
    "REPORT_SENT_TO_DOCTOR",
    "PATIENT_REPORT",
    report.id,
    {
      linkedDoctorId: doctorUserId,
      sentAt: report.createdAt.toISOString(),
    }
  );

  return report;
}

/**
 * DEPRECATED - Patient reports now stored in MongoDB
 * Use API routes: GET /api/reports?createdByUserId={id}
 */
export function listPatientReportsByPatient(patientId: string): PatientProblemReport[] {
  console.warn('listPatientReportsByPatient is deprecated - use API /api/reports');
  return [];
}

/**
 * DEPRECATED - Patient reports now stored in MongoDB
 * Use API routes: GET /api/reports?linkedDoctorId={id}
 */
export function listReportsForDoctor(doctorId: string): PatientProblemReport[] {
  console.warn('listReportsForDoctor is deprecated - use API /api/reports');
  return [];
}

/**
 * Get report by ID
 */
export function getReportById(reportId: string): PatientProblemReport | undefined {
  return patientReports.find((r) => r.id === reportId);
}

/**
 * Doctor reply to a patient report (DEPRECATED - Use API)
 * This function updates mock localStorage only for backwards compatibility
 * with existing doctor reply functionality until API is implemented
 */
export function doctorReplyToReport(
  reportId: string,
  doctorUserId: string,
  doctorAssessment: string,
  actionTaken: string,
  adviceGiven: string,
  needsEscalation: boolean
): void {
  // Create audit log only - actual reply should go through API
  createAuditLog(
    doctorUserId,
    Role.DOCTOR,
    "DOCTOR_REPLIED_TO_REPORT",
    "PATIENT_REPORT",
    reportId,
    {
      doctorAssessment,
      actionTaken,
      adviceGiven,
      needsEscalation: String(needsEscalation),
      repliedAt: new Date().toISOString(),
    }
  );
}

/**
 * Escalate MongoDB report to PV (creates PV case from MongoDB report data)
 */
export function escalateReportToPV(
  reportId: string,
  pvUserId: string,
  reportData: {
    patientName?: string;
    patientAge?: number;
    patientContact?: string;
    medicineName: string;
    symptomDescription: string;
    severity: Severity;
    createdAt: Date;
  }
): { caseId: string } {
  // Create a PV case from the MongoDB report
  const newCase: Case = {
    id: `case-${Date.now()}`,
    caseNumber: `CASE-${new Date().getFullYear()}-${String(mockCases.length + 1).padStart(3, "0")}`,
    patientInitials: reportData.patientName?.split(" ").map(n => n[0]).join("") || "??",
    patientAge: reportData.patientAge,
    patientGender: undefined,
    productName: reportData.medicineName,
    batchNumber: undefined,
    adverseEvent: reportData.symptomDescription,
    severity: reportData.severity,
    reportedDate: reportData.createdAt,
    reporterName: reportData.patientName || "Patient (via report)",
    reporterContact: reportData.patientContact,
    assignedToId: pvUserId,
    status: "OPEN",
    createdById: pvUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceReportId: reportId,
    source: "PATIENT_REPORT",
  };

  mockCases.push(newCase);

  // Create audit log
  createAuditLog(
    pvUserId,
    Role.PV_OFFICER,
    "REPORT_ESCALATED_TO_PV",
    "PATIENT_REPORT",
    reportId,
    {
      linkedCaseId: newCase.id,
      caseNumber: newCase.caseNumber,
    }
  );

  return { caseId: newCase.id };
}

/**
 * Get audit logs for a patient report
 */
export function getAuditLogsByReport(reportId: string): AuditLog[] {
  return auditLogs
    .filter((log) => log.entityType === "PATIENT_REPORT" && log.entityId === reportId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

