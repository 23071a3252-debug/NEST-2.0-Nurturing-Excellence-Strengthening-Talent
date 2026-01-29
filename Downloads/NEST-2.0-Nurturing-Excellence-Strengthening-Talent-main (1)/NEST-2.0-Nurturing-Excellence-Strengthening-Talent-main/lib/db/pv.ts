/**
 * PV Officer Database Operations
 * Handles PV cases, follow-up tasks, and activity logging
 */

import { getDb } from "./mongodb";
import { ObjectId } from "mongodb";
import {
  PVCase,
  PVFollowUpTask,
  PVActivityLog,
  CreatePVFollowUpTaskInput,
  UpdatePVFollowUpTaskInput,
  EscalatePVCaseInput,
  AddPVNoteInput,
  PVDashboardStats,
} from "@/types/pv";

const PV_CASES_COLLECTION = "pv_cases";
const PV_FOLLOWUP_TASKS_COLLECTION = "pv_followup_tasks";
const PV_ACTIVITY_LOG_COLLECTION = "pv_activity_log";

// ============================================================================
// PV CASE OPERATIONS
// ============================================================================

/**
 * Get all PV cases with optional filtering
 */
export async function getPVCases(filter: {
  status?: string;
  assignedTo?: string;
  severity?: string;
  search?: string;
  skip?: number;
  limit?: number;
} = {}) {
  const db = await getDb();
  const collection = db.collection<PVCase>(PV_CASES_COLLECTION);

  const query: any = {};
  if (filter.status) query.status = filter.status;
  if (filter.assignedTo) query.assignedTo = filter.assignedTo;
  if (filter.severity)
    query["sourceReportSnapshot.questionnaire.severity"] = filter.severity;
  if (filter.search) {
    query.$or = [
      { "sourceReportSnapshot.questionnaire.medicineName": { $regex: filter.search, $options: "i" } },
      { "sourceReportSnapshot.patientInfo.name": { $regex: filter.search, $options: "i" } },
    ];
  }

  const skip = filter.skip || 0;
  const limit = filter.limit || 50;

  return collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Get a single PV case by ID
 */
export async function getPVCaseById(caseId: string) {
  const db = await getDb();
  const collection = db.collection<PVCase>(PV_CASES_COLLECTION);

  return collection.findOne({ _id: new ObjectId(caseId) });
}

/**
 * Update PV case status
 */
export async function updatePVCaseStatus(
  caseId: string,
  newStatus: PVCase["status"],
  updatedBy: string
) {
  const db = await getDb();
  const collection = db.collection<PVCase>(PV_CASES_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(caseId) },
    {
      $set: {
        status: newStatus,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: caseId,
      performedBy: updatedBy,
      performedByRole: "PV_OFFICER",
      actionType: "CASE_STATUS_UPDATED",
      description: `Case status updated from ${result.value.status} to ${newStatus}`,
      metadata: {
        oldStatus: result.value.status,
        newStatus,
      },
    });
  }

  return result.value;
}

/**
 * Assign PV case to an officer
 */
export async function assignPVCase(
  caseId: string,
  assignedTo: string,
  assignedBy: string
) {
  const db = await getDb();
  const collection = db.collection<PVCase>(PV_CASES_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(caseId) },
    {
      $set: {
        assignedTo,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: caseId,
      performedBy: assignedBy,
      performedByRole: "SAFETY_LEAD",
      actionType: "CASE_ASSIGNED",
      description: `Case assigned to PV Officer ${assignedTo}`,
    });
  }

  return result.value;
}

/**
 * Add note to PV case
 */
export async function addPVCaseNote(
  caseId: string,
  input: AddPVNoteInput,
  addedBy: string
) {
  const db = await getDb();
  const collection = db.collection<PVCase>(PV_CASES_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(caseId) },
    {
      $push: {
        pvOfficerNotes: {
          pvOfficerId: addedBy,
          note: input.note,
          timestamp: new Date(),
        },
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: caseId,
      performedBy: addedBy,
      performedByRole: "PV_OFFICER",
      actionType: "NOTE_ADDED",
      description: `Note added: ${input.note.substring(0, 100)}...`,
    });
  }

  return result.value;
}

/**
 * Escalate PV case to Safety Lead
 */
export async function escalatePVCase(
  caseId: string,
  input: EscalatePVCaseInput,
  escalatedBy: string
) {
  const db = await getDb();
  const collection = db.collection<PVCase>(PV_CASES_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(caseId) },
    {
      $set: {
        status: "ESCALATED",
        updatedAt: new Date(),
      },
      $push: {
        pvOfficerNotes: {
          pvOfficerId: escalatedBy,
          note: `ESCALATION: ${input.escalationReason}`,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: caseId,
      performedBy: escalatedBy,
      performedByRole: "PV_OFFICER",
      actionType: "CASE_ESCALATED",
      description: `Case escalated to Safety Lead: ${input.escalationReason}`,
      metadata: {
        escalationReason: input.escalationReason,
        requiredActions: input.requiredActions,
        priority: input.priority,
      },
    });
  }

  return result.value;
}

/**
 * Close PV case
 */
export async function closePVCase(
  caseId: string,
  closedBy: string,
  notes?: string
) {
  const db = await getDb();
  const collection = db.collection<PVCase>(PV_CASES_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(caseId) },
    {
      $set: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
      $push: {
        pvOfficerNotes: {
          pvOfficerId: closedBy,
          note: `CASE CLOSED: ${notes || "No additional notes"}`,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: caseId,
      performedBy: closedBy,
      performedByRole: "PV_OFFICER",
      actionType: "CASE_CLOSED",
      description: `Case closed: ${notes || "No additional notes"}`,
    });
  }

  return result.value;
}

// ============================================================================
// FOLLOW-UP TASK OPERATIONS
// ============================================================================

/**
 * Create a follow-up task for a doctor
 */
export async function createFollowUpTask(
  input: CreatePVFollowUpTaskInput,
  createdBy: string
): Promise<PVFollowUpTask> {
  const db = await getDb();
  const collection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const task: PVFollowUpTask = {
    pvCaseId: input.pvCaseId,
    doctorId: input.doctorId,
    createdBy,
    createdAt: new Date(),
    title: input.title,
    description: input.description,
    requiredFields: input.requiredFields,
    priority: input.priority,
    status: "PENDING",
    dueDate: input.dueDate,
    reminderCount: 0,
  };

  const result = await collection.insertOne(task);

  // Log activity
  await logPVActivity({
    pvCaseId: input.pvCaseId,
    performedBy: createdBy,
    performedByRole: "PV_OFFICER",
    actionType: "FOLLOWUP_CREATED",
    description: `Follow-up task created: ${input.title}`,
    metadata: {
      followUpId: result.insertedId.toString(),
      priority: input.priority,
      dueDate: input.dueDate,
    },
  });

  // Update case status
  await updatePVCaseStatus(input.pvCaseId, "FOLLOWUP_REQUESTED", createdBy);

  return { ...task, _id: result.insertedId };
}

/**
 * Send follow-up task to doctor
 */
export async function sendFollowUpTask(
  taskId: string,
  sentBy: string
) {
  const db = await getDb();
  const collection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(taskId) },
    {
      $set: {
        status: "SENT",
        sentAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: result.value.pvCaseId,
      performedBy: sentBy,
      performedByRole: "PV_OFFICER",
      actionType: "FOLLOWUP_SENT",
      description: `Follow-up task sent to doctor: ${result.value.title}`,
      metadata: {
        followUpId: taskId,
      },
    });
  }

  return result.value;
}

/**
 * Get follow-up tasks for a PV case
 */
export async function getFollowUpTasksByCase(pvCaseId: string) {
  const db = await getDb();
  const collection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  return collection
    .find({ pvCaseId })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Get follow-up tasks for a doctor
 */
export async function getFollowUpTasksForDoctor(doctorId: string, status?: string) {
  const db = await getDb();
  const collection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const query: any = { doctorId };
  if (status) query.status = status;

  return collection
    .find(query)
    .sort({ dueDate: 1, createdAt: -1 })
    .toArray();
}

/**
 * Update follow-up task status
 */
export async function updateFollowUpTaskStatus(
  taskId: string,
  input: UpdatePVFollowUpTaskInput,
  updatedBy: string
) {
  const db = await getDb();
  const collection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const updateData: any = {
    status: input.status,
    updatedAt: new Date(),
  };

  if (input.status === "COMPLETED") {
    updateData.completedAt = new Date();
  }

  if (input.doctorResponse) {
    updateData.doctorResponse = {
      submittedAt: new Date(),
      ...input.doctorResponse,
    };
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(taskId) },
    { $set: updateData },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: result.value.pvCaseId,
      performedBy: updatedBy,
      performedByRole: "DOCTOR",
      actionType:
        input.status === "COMPLETED" ? "FOLLOWUP_COMPLETED" : "FOLLOWUP_SENT",
      description: `Follow-up task status updated to ${input.status}`,
      metadata: {
        followUpId: taskId,
        newStatus: input.status,
      },
    });
  }

  return result.value;
}

/**
 * Mark follow-up task as overdue
 */
export async function markFollowUpTaskOverdue(taskId: string) {
  const db = await getDb();
  const collection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(taskId) },
    {
      $set: {
        status: "OVERDUE",
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  // Log activity
  if (result.value) {
    await logPVActivity({
      pvCaseId: result.value.pvCaseId,
      performedBy: "SYSTEM",
      performedByRole: "ADMIN",
      actionType: "FOLLOWUP_OVERDUE",
      description: `Follow-up task marked as overdue: ${result.value.title}`,
      metadata: {
        followUpId: taskId,
        dueDate: result.value.dueDate,
      },
    });
  }

  return result.value;
}

/**
 * Send reminder for follow-up task
 */
export async function sendFollowUpReminder(taskId: string) {
  const db = await getDb();
  const collection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(taskId) },
    {
      $inc: { reminderCount: 1 },
      $set: {
        lastReminderSentAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result.value;
}

// ============================================================================
// ACTIVITY LOG OPERATIONS
// ============================================================================

/**
 * Log PV activity
 */
export async function logPVActivity(activity: Omit<PVActivityLog, "_id">) {
  const db = await getDb();
  const collection = db.collection<PVActivityLog>(PV_ACTIVITY_LOG_COLLECTION);

  const log: PVActivityLog = {
    timestamp: new Date(),
    ...activity,
  };

  return collection.insertOne(log);
}

/**
 * Get activity log for a case
 */
export async function getPVActivityLog(
  pvCaseId: string,
  limit: number = 100
) {
  const db = await getDb();
  const collection = db.collection<PVActivityLog>(PV_ACTIVITY_LOG_COLLECTION);

  return collection
    .find({ pvCaseId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

/**
 * Get PV Officer dashboard statistics
 */
export async function getPVDashboardStats(
  assignedTo?: string
): Promise<PVDashboardStats> {
  const db = await getDb();
  const casesCollection = db.collection<PVCase>(PV_CASES_COLLECTION);
  const tasksCollection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const caseQuery: any = {};
  if (assignedTo) caseQuery.assignedTo = assignedTo;

  const now = new Date();

  const [cases, overdueCasesCount, completedCasesCount, escalatedCasesCount, severeCasesCount, pendingTasksCount, overdueTasksCount] = await Promise.all([
    casesCollection.find(caseQuery).toArray(),
    casesCollection.countDocuments({
      ...caseQuery,
      status: "FOLLOWUP_REQUESTED",
      updatedAt: { $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    }),
    casesCollection.countDocuments({
      ...caseQuery,
      status: "COMPLETED",
    }),
    casesCollection.countDocuments({
      ...caseQuery,
      status: "ESCALATED",
    }),
    casesCollection.countDocuments({
      ...caseQuery,
      "sourceReportSnapshot.questionnaire.severity": "SEVERE",
    }),
    tasksCollection.countDocuments({
      ...(assignedTo ? { createdBy: assignedTo } : {}),
      status: "PENDING",
    }),
    tasksCollection.countDocuments({
      ...(assignedTo ? { createdBy: assignedTo } : {}),
      status: "OVERDUE",
    }),
  ]);

  const openCases = cases.filter((c) => c.status === "UNDER_REVIEW").length;
  const awaitingFollowUp = cases.filter(
    (c) => c.status === "FOLLOWUP_REQUESTED"
  ).length;

  return {
    totalCases: cases.length,
    openCases,
    awaitingFollowUp,
    overdueCases: overdueCasesCount,
    completedCases: completedCasesCount,
    escalatedCases: escalatedCasesCount,
    severeCases: severeCasesCount,
    pendingTasks: pendingTasksCount,
    overdueTasks: overdueTasksCount,
  };
}

/**
 * Get overdue cases and tasks
 */
export async function getOverdueItems(assignedTo?: string) {
  const db = await getDb();
  const casesCollection = db.collection<PVCase>(PV_CASES_COLLECTION);
  const tasksCollection = db.collection<PVFollowUpTask>(
    PV_FOLLOWUP_TASKS_COLLECTION
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const caseQuery: any = {
    status: "FOLLOWUP_REQUESTED",
    updatedAt: { $lt: sevenDaysAgo },
  };
  if (assignedTo) caseQuery.assignedTo = assignedTo;

  const taskQuery: any = {
    status: "PENDING",
    dueDate: { $lt: now },
  };
  if (assignedTo) taskQuery.createdBy = assignedTo;

  const [overdueCases, overdueTasks] = await Promise.all([
    casesCollection
      .find(caseQuery)
      .sort({ updatedAt: 1 })
      .toArray(),
    tasksCollection
      .find(taskQuery)
      .sort({ dueDate: 1 })
      .toArray(),
  ]);

  return { overdueCases, overdueTasks };
}
