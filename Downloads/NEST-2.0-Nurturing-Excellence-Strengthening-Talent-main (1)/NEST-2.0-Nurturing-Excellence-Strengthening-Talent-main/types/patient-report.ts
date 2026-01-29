/**
 * Patient Problem Report types
 */

import { Severity } from "./enums";

export type ReportStatus =
  | "NEW"
  | "SENT_TO_DOCTOR"
  | "DOCTOR_REPLIED"
  | "ESCALATED_TO_PV"
  | "CLOSED";

export type ReportCreatorRole = "PATIENT" | "DOCTOR";

export interface PatientProblemReport {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdByRole: ReportCreatorRole;
  createdByUserId: string;
  linkedDoctorId: string; // Required: patient chooses doctor or doctor-created uses own id
  status: ReportStatus;
  
  // Patient info (minimal, optional for doctor-created)
  patientInfo?: {
    name?: string;
    age?: number;
    contact?: string;
  };
  
  // Patient/doctor questionnaire
  questionnaire: {
    symptomDescription: string;
    startTime: string; // ISO datetime
    severity: Severity;
    medicineName: string;
    doseAndDuration: string;
    currentCondition: string;
    additionalNotes?: string;
  };
  
  // Doctor reply (filled when doctor responds)
  doctorReply?: {
    doctorAssessment: string;
    suspectedADR: boolean;
    actionTaken: string;
    adviceGiven: string;
    escalateToPV: boolean;
    repliedAt: Date;
  };
  
  // Link to PV case (if escalated)
  linkedCaseId?: string;
}

export interface CreatePatientReportInput {
  linkedDoctorId: string;
  patientInfo?: {
    name?: string;
    age?: number;
    contact?: string;
  };
  questionnaire: {
    symptomDescription: string;
    startTime: string;
    severity: Severity;
    medicineName: string;
    doseAndDuration: string;
    currentCondition: string;
    additionalNotes?: string;
  };
}

export interface DoctorReplyInput {
  doctorAssessment: string;
  suspectedADR: boolean;
  actionTaken: string;
  adviceGiven: string;
  escalateToPV: boolean;
}
