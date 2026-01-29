# PV Officer Module - Getting Started Guide

## What is the PV Officer Module?

The PV Officer Module is a comprehensive pharmacovigilance case management system integrated into NEST 2.0. It enables PV Officers to:

- Review escalated adverse event cases
- Track and manage follow-up requests
- Maintain complete audit trails
- Escalate critical cases to Safety Officers
- Monitor case status and timelines
- Export cases for regulatory submission

---

## Quick Start (5 minutes)

### 1. Access the PV Dashboard

**Login Credentials:**
- Email: `pv@test.com`
- OTP: `123456`
- Role: PV_OFFICER

**URL:** `http://localhost:3000/pv`

### 2. Explore the Dashboard

You'll see:
- **Key Statistics**: Total cases, open cases, pending follow-ups, escalated cases
- **Filter Panel**: Filter by status, severity, and search
- **Case List**: All active PV cases with quick overview

### 3. View a Case

- Click any case in the list
- See complete case details in the Overview tab
- Check follow-ups in the Follow-ups tab
- Review activity log in the Activity tab

### 4. Create a Follow-Up Task

1. Go to case detail page
2. Click "Request Additional Information" button
3. Select missing fields or specify custom requirements
4. Add notes explaining what's needed
5. Click "Send Request"
6. Doctor receives notification automatically

### 5. Monitor Progress

- Dashboard shows key metrics in real-time
- Review activity log for all actions
- Check follow-up task status
- Escalate if needed

---

## Module Architecture

```
PV Officer Module
├── Database Layer (lib/db/pv.ts)
│   ├── Case Operations
│   ├── Follow-Up Task Operations
│   └── Activity Logging
│
├── API Routes (app/api/pv-*)
│   ├── /pv-cases - Case management
│   ├── /pv-followups - Follow-up tasks
│   ├── /pv-dashboard - Statistics
│   └── /pv-cases/[id]/* - Case operations
│
├── UI Components (app/(pv)/pv/*)
│   ├── Dashboard page (with filtering)
│   ├── Case detail page (with tabs)
│   └── Modals (follow-ups, escalation)
│
└── Reusable Components (components/pv/*)
    ├── DashboardStats
    ├── FollowUpTaskList
    └── ActivityLog
```

---

## Key Concepts

### Case Status Flow

```
UNDER_REVIEW
    ↓ (Request info from doctor)
FOLLOWUP_REQUESTED
    ↓ (All info received)
COMPLETED
    ↓ (Export for regulatory)
EXPORTED

Alternative: ESCALATED (if urgent)
```

### Follow-Up Task Status Flow

```
PENDING
    ↓ (Sent to doctor)
SENT
    ↓ (Doctor opened)
IN_PROGRESS
    ↓ (Doctor submitted)
COMPLETED

Alternative: OVERDUE (if past due date)
```

### Priority Levels

- **P0**: Critical - 24-hour SLA (deaths, serious outcomes)
- **P1**: High - 3-5 day SLA (moderate severity)
- **P2**: Normal - 1-2 week SLA (routine follow-ups)

---

## Main Features

### 1. Dashboard Statistics

**Real-time metrics:**
- Total cases count
- Open cases awaiting review
- Pending follow-ups (with overdue count)
- Escalated cases requiring urgent attention
- Completed cases ready for export
- Severe cases requiring extra attention

**Example:**
```
Total Cases: 42
├─ Open: 8
├─ Pending Follow-Up: 15 (3 overdue)
├─ Escalated: 2
├─ Completed: 15
└─ Severe: 7
```

### 2. Advanced Filtering

**Filter by:**
- Status (All, Under Review, Awaiting Follow-Up, Escalated, Completed)
- Severity (All, Severe, Moderate, Mild)
- Medicine name or case ID (search)
- Multiple filters applied simultaneously

**Example workflow:**
1. Show only SEVERE cases that are ESCALATED
2. Quickly identify critical cases
3. Prioritize Safety Lead escalation

### 3. Case Management

**View complete information:**
- Patient details (name, age, contact)
- Adverse event description
- Medicine name, dosage, duration
- Doctor's medical assessment
- Escalation questionnaire answers
- All previous notes

**Take actions:**
- Add notes to case
- Request additional information
- Escalate to Safety Officer
- Close case when complete

### 4. Follow-Up Task Tracking

**Create tasks with:**
- Auto-detected missing fields
- Custom field specifications
- Priority assignment (P0, P1, P2)
- Due date selection
- Detailed instructions to doctor

**Track progress:**
- View task status and timeline
- See doctor responses
- Monitor for overdue tasks
- Receive automatic reminders

### 5. Activity Timeline

**Complete audit trail shows:**
- Every action taken on case
- Who performed each action (user + role)
- Exactly when it happened
- What changed and why
- Full compliance tracking

**Example timeline:**
```
3 minutes ago: John (PV_OFFICER) - Case Status Updated: UNDER_REVIEW → FOLLOWUP_REQUESTED
1 hour ago: Jane (DOCTOR) - Follow-Up Task Created: Lab Results Required
2 hours ago: System - Case Created: escalated from doctor report
```

---

## Workflows

### Workflow 1: Routine Follow-Up

**Scenario:** Case has incomplete information

1. PV Officer reviews case
2. Identifies missing fields
3. Clicks "Request Additional Information"
4. Selects missing fields (e.g., "Lab Results", "Prior History")
5. System auto-fills from detected missing fields
6. Adds notes: "Need complete lab work to assess severity"
7. Sets due date: 3 days
8. Submits
9. **Result:** Doctor receives notification, task appears in their queue
10. Doctor fills in information within 3 days
11. PV Officer reviews doctor's response
12. Marks task complete
13. **Case progresses:** UNDER_REVIEW → FOLLOWUP_REQUESTED → COMPLETED

### Workflow 2: Critical Escalation

**Scenario:** Serious adverse event detected

1. PV Officer reviews case
2. Recognizes critical safety signal
3. Clicks "Escalate to Safety Lead"
4. Sets priority: P0 (Critical)
5. Explains reason: "Patient hospitalized, possible causality"
6. Submits escalation
7. **Result:** 
   - Case marked as ESCALATED
   - Safety Officer receives urgent notification
   - Activity logged with timestamp and reason
   - All previous actions preserved for reference

### Workflow 3: Case Export

**Scenario:** Case ready for regulatory submission

1. PV Officer confirms all information complete
2. Reviews activity log for completeness
3. Ensures all follow-ups addressed
4. Updates status to COMPLETED
5. Case becomes eligible for export
6. **Result:** Case can be exported for regulatory submission

---

## Real-World Scenarios

### Scenario 1: Patient Hospitalization Report

**Situation:**
- Doctor reports patient hospitalized after drug reaction
- Reports to PV system
- Case escalated with SEVERE severity

**PV Officer Action:**
1. Login to dashboard
2. Filter: Status = "UNDER_REVIEW", Severity = "SEVERE"
3. Click the case
4. Review Overview tab: Patient hospitalized, symptoms documented
5. Check doctor assessment (read-only)
6. Escalate to Safety Officer: "SEVERE patient hospitalization, potential causality"
7. Set Priority: P0
8. Activity auto-logged
9. Safety Officer notified automatically
10. Case marked ESCALATED

### Scenario 2: Incomplete Initial Report

**Situation:**
- Doctor submits report but misses some required fields
- Lab results not provided
- Prior medication history incomplete

**PV Officer Action:**
1. Review case in Overview tab
2. See missing fields highlighted in yellow
3. Click "Request Additional Information"
4. System pre-selects 3 detected missing fields
5. Add note: "Please provide complete lab work and medication history"
6. Set due date: 5 days
7. Submit request
8. **Doctor receives:** Notification with specific requests
9. Doctor provides information within 5 days
10. Task marked COMPLETED
11. Case progresses to COMPLETED status

### Scenario 3: Follow-Up After Export

**Situation:**
- Case previously exported for regulatory submission
- New information comes to light (additional adverse events)

**PV Officer Action:**
1. Reopen case from EXPORTED status
2. Update status back to COMPLETED
3. Create new follow-up task with additional investigation
4. Escalate if needed based on new information
5. Update case with new findings
6. All changes tracked in activity log

---

## Common Tasks

### Task: Review All Critical Cases

```
1. Dashboard → Filter by Status = ESCALATED
2. Filter by Severity = SEVERE (optional)
3. Review each case
4. Coordinate with Safety Lead
5. Document findings in notes
```

### Task: Check Overdue Follow-Ups

```
1. Dashboard shows overdue count
2. Filter by Status = FOLLOWUP_REQUESTED
3. Review cases with overdue badges
4. Send reminders to doctors
5. Follow up on responses
```

### Task: Generate Weekly Report

```
1. Dashboard Statistics → Record numbers
2. Filter Completed cases for week
3. Filter Escalated cases for week
4. Activity Log → Review all actions
5. Export data for compliance
```

### Task: Monitor New Cases

```
1. Sort by Created date (newest first)
2. Review new UNDER_REVIEW cases
3. Prioritize SEVERE cases
4. Assign to team if needed
5. Create follow-ups as needed
```

---

## Tips & Best Practices

### 1. Case Management
- ✅ Always review missing fields before creating follow-ups
- ✅ Be specific in follow-up requests
- ✅ Set realistic due dates (3-5 days typical)
- ✅ Document decisions in case notes
- ✅ Use priority levels consistently

### 2. Follow-Up Coordination
- ✅ Use P0 only for genuinely critical cases
- ✅ Track reminders for overdue tasks
- ✅ Provide clear instructions to doctors
- ✅ Review all doctor responses thoroughly
- ✅ Keep detailed notes for compliance

### 3. Escalation
- ✅ Escalate only when justified
- ✅ Document escalation reasoning
- ✅ Provide context for Safety Lead
- ✅ Use escalation sparingly for true urgent cases
- ✅ Follow up on escalated cases regularly

### 4. Audit Trail
- ✅ All actions automatically logged
- ✅ Activity log never modified (compliance)
- ✅ Use for quality assurance
- ✅ Reference for investigations
- ✅ Timestamp all decisions

---

## Troubleshooting

### Issue: Case Not Showing in Dashboard

**Possible Causes:**
1. Case not assigned to you (check assignedTo filter)
2. Case in different status than filtered
3. Case in different severity level
4. Search term doesn't match

**Solution:**
- Remove filters one by one
- Check "All" for each filter
- Verify case ID in direct URL

### Issue: Can't Create Follow-Up

**Possible Causes:**
1. Case already completed/exported
2. No required fields selected
3. Missing userId in request

**Solution:**
- Check case status
- Select at least one field
- Verify logged-in user has PV_OFFICER role

### Issue: Activity Log Not Showing

**Possible Causes:**
1. No actions yet taken on case
2. Wrong case ID
3. Activity log limit reached

**Solution:**
- Check timestamp to see if actions exist
- Verify case ID matches
- Most recent 100 actions shown by default

---

## Documentation References

- **Complete API**: [API_REFERENCE_PV.md](API_REFERENCE_PV.md)
- **Module Guide**: [docs/pv-officer-module.md](docs/pv-officer-module.md)
- **Implementation**: [PV_OFFICER_IMPLEMENTATION.md](PV_OFFICER_IMPLEMENTATION.md)

---

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review documentation references
3. Check activity log for detailed history
4. Contact system administrator

---

## Quick Reference

### Dashboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Filter by status | Click status filter |
| Filter by severity | Click severity filter |
| Search case | Type in search box |
| View case details | Click case in list |
| Create follow-up | Click "Request Info" button |
| Escalate case | Click "Escalate" button |
| View activity | Go to Activity tab |

### Status Colors

| Status | Color |
|--------|-------|
| Under Review | Blue |
| Awaiting Follow-Up | Amber |
| Escalated | Red |
| Completed | Green |
| Severe | Red (badge) |

### Priority Colors

| Priority | Color |
|----------|-------|
| P0 (Critical) | Red |
| P1 (High) | Orange |
| P2 (Normal) | Blue |

---

## Next Steps

1. **Login** with `pv@test.com` / `123456`
2. **Explore** the dashboard and filters
3. **View** a case to understand the structure
4. **Create** a follow-up task
5. **Monitor** the activity log
6. **Read** full documentation for advanced features

---

**Welcome to the PV Officer Module! Let's ensure medication safety together. 🏥**
