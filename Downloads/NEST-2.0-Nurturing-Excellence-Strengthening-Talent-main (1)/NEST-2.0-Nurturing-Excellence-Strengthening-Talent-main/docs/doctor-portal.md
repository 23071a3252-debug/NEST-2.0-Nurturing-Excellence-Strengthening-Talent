# Doctor Portal Documentation

## Overview

The Doctor Portal allows healthcare providers to view assigned follow-up tasks and complete structured follow-up forms for adverse event cases.

## Features

✅ **Task Dashboard** - View all assigned follow-up tasks
✅ **Task Filtering** - Filter by all, pending, or completed
✅ **Priority Indicators** - Visual priority badges (P0, P1, P2)
✅ **Status Tracking** - Real-time status updates
✅ **Overdue Alerts** - Automatic overdue task highlighting
✅ **Structured Forms** - Validated follow-up forms
✅ **Draft Saving** - Save work in progress
✅ **Success Confirmation** - Clear submission feedback

## Routes

### Dashboard: `/doctor`
Main landing page showing all assigned tasks with:
- Task statistics (Pending, In Progress, Completed)
- Filterable task list
- Quick task overview

### Task Detail: `/doctor/tasks/[taskId]`
Individual task page with:
- Case information
- Follow-up form
- Validation
- Draft/Submit actions

## Mock Data

Located in [lib/data/mock-data.ts](../lib/data/mock-data.ts)

### Sample Tasks
- **task-001**: P1 Priority, SENT status
- **task-002**: P2 Priority, OPENED status
- **task-003**: P0 Priority (URGENT), IN_PROGRESS status

### Sample Cases
- **CASE-2024-001**: Cardio-XR 500mg (Moderate severity)
- **CASE-2024-002**: Allergen-B Injection (Mild severity)
- **CASE-2024-003**: NeuroCalm 100mg (Severe severity)

## Task Dashboard

### Statistics Cards
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Pending Tasks   │  │ In Progress     │  │ Completed       │
│       3         │  │       1         │  │       0         │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Task Card Information
Each task displays:
- **Priority Badge**: P0 (Critical), P1 (High), P2 (Normal)
- **Status Badge**: Current task status
- **Overdue Badge**: If past due date
- **Case ID**: Unique case identifier
- **Drug Name**: Product involved
- **Patient Initials**: De-identified patient
- **Severity**: Adverse event severity
- **Due Date**: Task deadline
- **Notes**: PV Officer instructions
- **Created Time**: When task was assigned

### Filter Options
- **All Tasks**: Show everything
- **Pending**: Not submitted yet
- **Completed**: Submitted/validated/closed

### Priority Colors
- **P0**: Red (Critical - immediate action)
- **P1**: Orange (High priority)
- **P2**: Blue (Normal priority)

### Status Colors
- **SENT**: Gray (New)
- **OPENED**: Blue (Viewed)
- **IN_PROGRESS**: Yellow (Working)
- **SUBMITTED**: Green (Done)
- **VALIDATED/CLOSED**: Teal (Complete)

## Follow-Up Form

### Form Fields

#### 1. Drug Name (Read-only)
- Pre-filled from case data
- Non-editable
- Example: "Cardio-XR 500mg"

#### 2. Dose * (Required)
- Text input
- Examples: "500mg", "10ml", "2 tablets"
- Min length: 2 characters
- Max length: 50 characters

#### 3. Duration of Use * (Required)
- Text input
- Examples: "7 days", "2 weeks", "3 months"
- Min length: 2 characters
- Max length: 50 characters

#### 4. Side Effect Start Time * (Required)
- Text input
- Examples: "2 hours after first dose", "Day 3 of treatment"
- Min length: 5 characters
- Max length: 200 characters

#### 5. Severity * (Required)
- Dropdown select
- Options:
  - Mild
  - Moderate
  - Severe

#### 6. Treatment Provided * (Required)
- Textarea
- Describe treatment given for adverse event
- Min length: 10 characters
- Max length: 1000 characters

#### 7. Current Patient Condition * (Required)
- Dropdown select
- Options:
  - Recovered
  - Recovering
  - Not Improved
  - Worsened
  - Unknown

#### 8. Additional Notes (Optional)
- Textarea
- Any additional observations
- Max length: 1000 characters

### Validation Rules

**Inline Validation:**
- Triggers on blur (when field loses focus)
- Shows error message below field
- Red border on invalid fields
- Only validates touched fields

**Form Validation:**
- Triggered on submit
- Validates all required fields
- Prevents submission if invalid
- Marks all fields as touched

**Required Field Indicator:**
- Fields marked with `*` are required
- Must be filled before submission

### Form Actions

#### Save as Draft
- Saves progress without validation
- Updates task status to IN_PROGRESS
- Allows returning later
- Shows success alert

#### Submit Follow-Up
- Validates all required fields
- Creates submission record
- Updates task status to SUBMITTED
- Shows success screen

## Task Status Flow

```
SENT → OPENED → IN_PROGRESS → SUBMITTED → VALIDATED → CLOSED
```

**Automatic Transitions:**
1. **SENT → OPENED**: When doctor first views task
2. **OPENED → IN_PROGRESS**: When draft is saved
3. **IN_PROGRESS → SUBMITTED**: When form is submitted

## Success Screen

After successful submission:
- ✓ Green checkmark icon
- Success message
- Case number reference
- "Back to Dashboard" button

## Code Structure

### Dashboard Component
```typescript
// app/(doctor)/doctor/page.tsx
- Load tasks for current doctor
- Enrich with case data
- Display statistics
- Filter and sort tasks
- Navigate to task detail
```

### Task Detail Component
```typescript
// app/(doctor)/tasks/[taskId]/page.tsx
- Load task and case data
- Auto-mark as OPENED
- Form state management
- Field validation
- Draft saving
- Submission handling
- Success screen
```

### Mock Data Functions
```typescript
// lib/data/mock-data.ts
getTasksByDoctorId(doctorId) // Get all tasks for doctor
getTaskById(taskId)          // Get specific task
getCaseById(caseId)          // Get case details
updateTaskStatus(...)        // Update task status
createSubmission(...)        // Save form submission
```

## Usage Examples

### Viewing Tasks

1. Login as doctor: `doctor@test.com`
2. Navigate to `/doctor`
3. View task list with 3 mock tasks
4. Click any task to open

### Completing a Follow-Up

1. Click on a task card
2. Task auto-marks as OPENED
3. Fill in required fields:
   - Dose: "500mg twice daily"
   - Duration: "10 days"
   - Side Effect Start Time: "3 hours after second dose"
   - Severity: "Moderate"
   - Treatment Provided: "Antihistamine given, symptoms monitored"
   - Current Condition: "Recovering"
4. Click "Submit Follow-Up"
5. View success screen
6. Return to dashboard

### Saving a Draft

1. Open a task
2. Fill in some fields
3. Click "Save as Draft"
4. See success alert
5. Task status updates to IN_PROGRESS
6. Can return later to complete

## Validation Examples

### Valid Inputs
```typescript
dose: "500mg"              ✓
duration: "7 days"         ✓
sideEffectStartTime: "2 hours after first dose" ✓
severity: "Moderate"       ✓
treatmentProvided: "Patient given antihistamine and monitored" ✓
currentCondition: "Recovering" ✓
```

### Invalid Inputs
```typescript
dose: "x"                  ✗ Too short (min 2 chars)
duration: ""               ✗ Required field
sideEffectStartTime: "NA"  ✗ Too short (min 5 chars)
severity: ""               ✗ Required field
treatmentProvided: "OK"    ✗ Too short (min 10 chars)
currentCondition: ""       ✗ Required field
```

## State Management

### Form State
```typescript
const [formData, setFormData] = useState<FormData>({
  drugName: "",
  dose: "",
  duration: "",
  // ... other fields
});
```

### Error State
```typescript
const [errors, setErrors] = useState<FormErrors>({});
const [touched, setTouched] = useState<Set<string>>(new Set());
```

### Loading States
```typescript
const [loading, setLoading] = useState(true);     // Initial load
const [submitting, setSubmitting] = useState(false); // Form submit
const [submitted, setSubmitted] = useState(false);   // Success state
```

## Testing the Portal

### Login as Doctor
```
Email: doctor@test.com
OTP: 123456
```

### Test Scenarios

1. **View Dashboard**
   - Should see 3 tasks
   - Stats: 3 pending, 1 in progress, 0 completed

2. **Filter Tasks**
   - Click "Pending" - see 3 tasks
   - Click "Completed" - see 0 tasks

3. **Open Task (P1 Priority)**
   - Click task-001 (Cardio-XR)
   - Status changes from SENT → OPENED

4. **Validate Required Fields**
   - Try submitting empty form
   - See validation errors
   - Fill fields one by one

5. **Save Draft**
   - Fill dose: "500mg"
   - Click "Save as Draft"
   - See success alert
   - Return to dashboard
   - Task status now IN_PROGRESS

6. **Complete Submission**
   - Open task again
   - Fill all required fields
   - Click "Submit Follow-Up"
   - See success screen
   - Return to dashboard
   - Task status now SUBMITTED

## Troubleshooting

### Task not loading
- Check taskId in URL
- Verify task exists in mock data
- Check browser console for errors

### Validation not working
- Ensure field names match exactly
- Check touched state
- Verify validation rules

### Submission not working
- Check all required fields
- Verify user is authenticated
- Check browser console

### Draft not saving
- Verify task ID is valid
- Check localStorage/state
- Ensure updateTaskStatus works

## Next Steps

To extend the doctor portal:

1. **Add more form types**
   - Different templates per case type
   - Dynamic field rendering

2. **File uploads**
   - Attach lab results
   - Upload images

3. **Real-time updates**
   - WebSocket for task changes
   - Push notifications

4. **History view**
   - Previous submissions
   - Audit trail

5. **Bulk actions**
   - Mark multiple as read
   - Export reports

6. **Search & filters**
   - Search by case number
   - Filter by date range
   - Sort by priority

## API Integration (Future)

Replace mock data with API calls:

```typescript
// Instead of:
const tasks = getTasksByDoctorId(doctorId);

// Use:
const tasks = await fetch(`/api/tasks?doctorId=${doctorId}`);
```

## Performance Notes

- Tasks load on mount
- Form validation is debounced on blur
- Success screen prevents back navigation
- Draft auto-saves every 30 seconds (future feature)

---

**The Doctor Portal is now fully functional with mock data and ready for API integration!**
