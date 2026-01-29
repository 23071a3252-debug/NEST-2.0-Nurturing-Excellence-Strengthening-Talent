# PV Officer Module Documentation

## Overview

The PV Officer module is responsible for managing Pharmacovigilance cases in the NEST system. PV Officers review escalated adverse event reports, manage follow-up tasks, track timelines, and maintain complete audit trails.

## Key Responsibilities

- **Case Management**: Review and manage PV cases escalated from doctors
- **Follow-Up Coordination**: Create and track follow-up tasks assigned to doctors
- **Case Analysis**: Access read-only patient reports and doctor assessments
- **Risk Assessment**: Monitor severity levels and overdue cases
- **Escalation**: Escalate critical cases to Safety Officers
- **Audit Trail**: Maintain comprehensive activity logs for compliance

## Database Models

### PVCase

Main entity representing a pharmacovigilance case.

```typescript
interface PVCase {
  _id?: string;
  createdAt: Date;
  updatedAt?: Date;
  
  // Source information
  sourceReportId: string;
  sourceReportSnapshot: {
    patientInfo?: { name?: string; age?: number; contact?: string };
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
  status: "UNDER_REVIEW" | "NEEDS_FOLLOWUP" | "FOLLOWUP_REQUESTED" | "COMPLETED" | "EXPORTED" | "ESCALATED";
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
```

**Status Transitions:**
- `UNDER_REVIEW` → Initial status when escalated to PV
- `FOLLOWUP_REQUESTED` → PV has sent follow-up request to doctor
- `COMPLETED` → All follow-ups completed, case ready for export
- `ESCALATED` → Critical case escalated to Safety Lead
- `EXPORTED` → Case exported for regulatory submission

### PVFollowUpTask

Represents a follow-up request sent to a doctor for a specific case.

```typescript
interface PVFollowUpTask {
  _id?: string;
  id?: string;
  pvCaseId: string;
  doctorId: string;
  createdBy: string; // PV Officer ID
  createdAt: Date;
  updatedAt?: Date;
  
  // Task details
  title: string;
  description?: string;
  requiredFields: string[]; // Data requested from doctor
  priority: "P0" | "P1" | "P2"; // P0=Critical, P1=High, P2=Normal
  status: "PENDING" | "SENT" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "CANCELLED";
  
  // Timeline
  dueDate: Date;
  sentAt?: Date;
  completedAt?: Date;
  acknowledgedAt?: Date;
  
  // Doctor response
  reminderCount: number;
  lastReminderSentAt?: Date;
  doctorResponse?: {
    submittedAt: Date;
    data: Record<string, any>;
    notes?: string;
    attachments?: string[];
  };
}
```

### PVActivityLog

Audit trail entry for all PV actions on a case.

```typescript
interface PVActivityLog {
  _id?: string;
  timestamp: Date;
  pvCaseId: string;
  
  // Actor information
  performedBy: string; // User ID
  performedByRole: "PV_OFFICER" | "SAFETY_LEAD" | "ADMIN" | "DOCTOR";
  
  // Action details
  actionType: 
    | "CASE_CREATED"
    | "CASE_ASSIGNED"
    | "CASE_STATUS_UPDATED"
    | "CASE_ESCALATED"
    | "CASE_CLOSED"
    | "FOLLOWUP_CREATED"
    | "FOLLOWUP_SENT"
    | "FOLLOWUP_COMPLETED"
    | "FOLLOWUP_OVERDUE"
    | "NOTE_ADDED"
    | "CASE_EXPORTED";
  
  description: string;
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    fieldChanged?: string;
    followUpId?: string;
    escalationReason?: string;
    [key: string]: any;
  };
}
```

## API Routes

### Case Management

#### GET /api/pv-cases
List all PV cases with optional filtering.

**Query Parameters:**
- `status`: Filter by case status
- `assignedTo`: Filter by assigned officer
- `severity`: Filter by severity level
- `search`: Search by medicine name or patient

**Response:**
```json
{
  "ok": true,
  "data": [PVCaseListItem[], ...]
}
```

#### GET /api/pv-cases/:id
Get complete case details including follow-ups and activity log.

**Response:**
```json
{
  "ok": true,
  "data": {
    "case": PVCase,
    "followUpTasks": PVFollowUpTask[],
    "activityLog": PVActivityLog[]
  }
}
```

#### PATCH /api/pv-cases/:id
Update case status or add notes.

**Request Body:**
```json
{
  "userId": "string",
  "status": "UNDER_REVIEW | COMPLETED | ...",
  "note": "string (optional)"
}
```

### Follow-Up Task Management

#### GET /api/pv-followups
List follow-up tasks by case or doctor.

**Query Parameters:**
- `caseId`: Get tasks for specific case
- `doctorId`: Get tasks assigned to doctor
- `status`: Filter by task status

#### POST /api/pv-followups
Create a new follow-up task.

**Request Body:**
```json
{
  "userId": "string",
  "pvCaseId": "string",
  "doctorId": "string",
  "title": "string",
  "description": "string (optional)",
  "requiredFields": ["string", ...],
  "priority": "P0 | P1 | P2",
  "dueDate": "ISO Date string"
}
```

#### PATCH /api/pv-followups/:id
Update follow-up task status or add doctor response.

**Request Body:**
```json
{
  "userId": "string",
  "status": "PENDING | SENT | IN_PROGRESS | COMPLETED | OVERDUE | CANCELLED",
  "doctorResponse": {
    "data": {},
    "notes": "string",
    "attachments": ["string", ...]
  }
}
```

### Escalation

#### POST /api/pv-cases/:id/escalate
Escalate case to Safety Lead.

**Request Body:**
```json
{
  "userId": "string",
  "escalationReason": "string",
  "priority": "P0 | P1 | P2",
  "requiredActions": ["string", ...]
}
```

### Activity Log

#### GET /api/pv-cases/:id/activity-log
Get complete activity log for a case.

**Query Parameters:**
- `limit`: Maximum number of logs (default: 100)

### Dashboard

#### GET /api/pv-dashboard/stats
Get dashboard statistics for PV officer.

**Query Parameters:**
- `assignedTo`: Get stats for specific officer

**Response:**
```json
{
  "ok": true,
  "data": {
    "stats": PVDashboardStats,
    "overdueCases": number,
    "overdueTasks": number
  }
}
```

## UI Components

### Dashboard
- **Location**: `app/(pv)/pv/page.tsx`
- **Features**:
  - Key statistics cards (total cases, open, pending follow-ups, escalated)
  - Advanced filtering (status, severity, search)
  - Case list with status highlighting
  - Color-coded severity levels

### Case Detail View
- **Location**: `app/(pv)/pv/cases/[id]/page.tsx`
- **Tabs**:
  - **Overview**: Case information, patient details, doctor assessment
  - **Follow-ups**: List of follow-up tasks with status tracking
  - **Activity**: Complete audit trail of all actions
- **Actions**:
  - Request additional information from doctor
  - Create follow-up tasks
  - Escalate to Safety Lead
  - Add notes to case

### Components
- `components/pv/DashboardStats.tsx` - Statistics cards display
- `components/pv/FollowUpTaskList.tsx` - Follow-up task list with details
- `components/pv/ActivityLog.tsx` - Timeline of case activities

## Database Operations

### PV Database Module
**Location**: `lib/db/pv.ts`

Key functions:
- `getPVCases()` - List cases with filtering
- `getPVCaseById()` - Get single case
- `updatePVCaseStatus()` - Update case status
- `assignPVCase()` - Assign to officer
- `addPVCaseNote()` - Add note to case
- `escalatePVCase()` - Escalate to Safety Lead
- `createFollowUpTask()` - Create new task
- `getFollowUpTasksByCase()` - Get tasks for case
- `updateFollowUpTaskStatus()` - Update task status
- `logPVActivity()` - Log activity
- `getPVActivityLog()` - Get activity logs
- `getPVDashboardStats()` - Get statistics

## Security

- **Role-based Access**: Only PV_OFFICER and SAFETY_LEAD can access this module
- **Audit Trail**: All actions are logged with actor information
- **Read-Only Access**: Medical data (patient reports, doctor assessments) is read-only
- **Data Validation**: All inputs are validated before database operations

## Features Implemented

### 1. PV Officer Dashboard ✅
- View all PV cases with status filtering
- Highlight incomplete and overdue cases
- Display severity levels with color coding
- Dashboard statistics with key metrics

### 2. PV Case List ✅
- Display CASE_ID with case details
- Patient and doctor references
- Created date and last updated time
- Status filtering and search
- Missing fields indicator

### 3. PV Case Detail View ✅
- Read-only patient report and doctor assessment
- Case timeline with activity log
- Follow-up task management
- Action buttons for follow-up requests and escalation
- Case notes and metadata

### 4. Follow-Up Task Management ✅
- Create follow-up tasks linked to CASE_ID
- Assign to specific doctor
- Set due date and priority level
- Track status (Pending, Completed, Overdue)
- Store doctor responses
- Automatic overdue detection

### 5. Audit Trail ✅
- Log all PV actions (case creation, follow-ups, escalation)
- Timestamp and actor tracking
- Detailed metadata for each action
- Complete activity log view

## Workflow Example

1. **Doctor Escalates Case**
   - Doctor identifies serious adverse event
   - Escalates report to PV
   - Case status: `UNDER_REVIEW`

2. **PV Officer Reviews**
   - Reviews case details and doctor assessment
   - Identifies missing information
   - Creates follow-up task for doctor
   - Activity logged: `FOLLOWUP_CREATED`

3. **Doctor Responds**
   - Receives follow-up task notification
   - Provides requested information
   - Submits response
   - Task status: `COMPLETED`

4. **PV Officer Finalizes**
   - Reviews doctor's response
   - All information complete
   - Updates case status: `COMPLETED`
   - Optional: Export case for regulatory submission

5. **Escalation (If Needed)**
   - Critical safety signal detected
   - Escalates to Safety Lead
   - Case status: `ESCALATED`
   - Priority flag set

## Best Practices

1. **Case Management**
   - Always review missing fields before creating follow-ups
   - Set appropriate priority levels based on severity
   - Document all decisions in case notes

2. **Follow-Up Coordination**
   - Clear descriptions of required information
   - Reasonable due dates (typically 3-7 days)
   - Set reminders for overdue tasks

3. **Escalation**
   - Use escalation sparingly for genuinely urgent cases
   - Provide clear reasoning in escalation notes
   - Set priority appropriately (P0, P1, P2)

4. **Audit Trail**
   - All actions are automatically logged
   - Review activity log for case history
   - Use for compliance and quality assurance

## Testing

The module includes mock data for testing. Default test cases are available with various statuses and severity levels.

### Mock Credentials
- Email: `pv@test.com`
- OTP: `123456`
- Role: `PV_OFFICER`

## Future Enhancements

- Automated reminders for overdue cases/tasks
- Batch operations for status updates
- Advanced analytics and reporting
- Integration with regulatory databases
- Case similarity matching
- Risk signal detection algorithms
