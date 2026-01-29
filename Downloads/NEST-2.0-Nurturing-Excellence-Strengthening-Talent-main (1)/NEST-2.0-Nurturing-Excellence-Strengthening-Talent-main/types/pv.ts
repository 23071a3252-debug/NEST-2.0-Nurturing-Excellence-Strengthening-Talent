/**
 * PV Case and Follow-up Types
 */

import { EscalationAnswers, ReportAttachment } from "./report";

export interface PVCase {
  _id?: string;
  createdAt: Date;
  updatedAt?: Date;
  
  // Source information
  sourceReportId: string;
  sourceReportSnapshot: {
    patientInfo?: {
      name?: string;
      age?: number;
      contact?: string;
    };
    questionnaire: {
      symptoms: string;
      startTime: string;
      severity: "MILD" | "MODERATE" | "SEVERE";
      medicineName: string;
      doseDuration: string;
      currentCondition: string;
      additionalNotes?: string;
    };
    attachments: ReportAttachment[];
    doctorReply?: {
      doctorId: string;
      doctorAssessment: string;
      actionTaken: string;
      adviceGiven: string;
      repliedAt: Date;
    };
  };
  
  // Escalation details
  escalationAnswers: EscalationAnswers;
  escalatedBy: string;
  escalatedAt: Date;
  
  // PV workflow
  assignedTo?: string;
  status: "UNDER_REVIEW" | "NEEDS_FOLLOWUP" | "FOLLOWUP_REQUESTED" | "COMPLETED" | "EXPORTED";
  missingFields?: string[];
  
  // Metadata
  pvOfficerNotes?: Array<{
    pvOfficerId: string;
    note: string;
    timestamp: Date;
  }>;
  
  exportedAt?: Date;
  exportedBy?: string;
  exportData?: any;
}

export interface Followup {
  _id?: string;
  id?: string;
  createdAt: Date;
  updatedAt?: Date;
  
  // References
  pvCaseId: string;
  reportId: string;
  requestedBy: string; // PV Officer ID
  assignedTo: string; // Doctor ID
  
  // Request details
  requestedFields: string[];
  requestNotes?: string;
  
  // Doctor response
  status: "PENDING" | "SUBMITTED" | "ACKNOWLEDGED";
  doctorResponse?: {
    submittedAt: Date;
    responses: Record<string, string>; // field -> answer
    additionalNotes?: string;
  };
  
  // PV acknowledgment
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface PVCaseListItem {
  id: string;
  createdAt: string;
  status: string;
  medicineName: string;
  severity: string;
  missingFieldsCount: number;
  hasFollowup: boolean;
  escalatedBy: string;
}

export interface AuditLog {
  _id?: string;
  timestamp: Date;
  entityType: "REPORT" | "PV_CASE" | "FOLLOWUP";
  entityId: string;
  action: string;
  performedBy: string;
  performedByRole: "PATIENT" | "DOCTOR" | "PV_OFFICER" | "SAFETY_LEAD" | "ADMIN";
  details?: any;
}
