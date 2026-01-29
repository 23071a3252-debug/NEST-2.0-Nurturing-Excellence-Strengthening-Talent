/**
 * MongoDB Report Types
 */

export interface ReportAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  uploadedAt: Date;
}

export interface EscalationAnswers {
  suspectedADR: string;
  seriousness: {
    isFatal: boolean;
    isLifeThreatening: boolean;
    requiresHospitalization: boolean;
    causesDisability: boolean;
    other?: string;
  };
  actionTaken: string;
  outcome: "RECOVERED" | "RECOVERING" | "NOT_RECOVERED" | "FATAL" | "UNKNOWN";
  reporterType: "HEALTHCARE_PROFESSIONAL" | "PATIENT" | "RELATIVE" | "OTHER";
  additionalNotes?: string;
}

export interface MongoReport {
  _id?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdByRole: "PATIENT" | "DOCTOR";
  createdByUserId: string;
  linkedDoctorId: string;
  linkedCaseId?: string;
  status: "SENT_TO_DOCTOR" | "DOCTOR_REPLIED" | "ESCALATION_DRAFT" | "ESCALATED_TO_PV" | "CLOSED";
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
    needsEscalation: boolean;
    repliedAt: Date;
  };
  escalation?: {
    escalatedBy: string;
    escalatedAt: Date;
    answers: EscalationAnswers;
  };
  doctorComments?: Array<{
    doctorId: string;
    comment: string;
    timestamp: Date;
  }>;
}

export interface ReportListItem {
  id: string;
  createdAt: string;
  severity: string;
  status: string;
  medicineName: string;
  hasImage: boolean;
  createdByRole: "PATIENT" | "DOCTOR";
  linkedDoctorId: string;
  symptomDescription: string;
  patientName?: string;
}

export interface ReportWithUrls extends Omit<MongoReport, '_id' | 'attachments'> {
  id: string;
  attachments: Array<ReportAttachment & { url: string }>;
}
