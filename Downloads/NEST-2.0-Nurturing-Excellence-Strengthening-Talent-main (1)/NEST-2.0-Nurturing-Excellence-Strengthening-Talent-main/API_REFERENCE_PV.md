# PV Officer API Quick Reference

## Base URL
```
/api
```

---

## Case Management

### List PV Cases
```
GET /pv-cases?status=UNDER_REVIEW&severity=SEVERE&search=aspirin
```

### Get Case Details
```
GET /pv-cases/{caseId}
Response: { case, followUpTasks, activityLog }
```

### Update Case
```
PATCH /pv-cases/{caseId}
Body: {
  userId: string,
  status?: "UNDER_REVIEW" | "FOLLOWUP_REQUESTED" | "COMPLETED" | "ESCALATED",
  note?: string
}
```

### Escalate Case
```
POST /pv-cases/{caseId}/escalate
Body: {
  userId: string,
  escalationReason: string,
  priority: "P0" | "P1" | "P2",
  requiredActions?: string[]
}
```

### Get Activity Log
```
GET /pv-cases/{caseId}/activity-log?limit=100
```

---

## Follow-Up Tasks

### List Follow-Ups
```
GET /pv-followups?caseId={caseId}
or
GET /pv-followups?doctorId={doctorId}&status=PENDING
```

### Create Follow-Up Task
```
POST /pv-followups
Body: {
  userId: string,
  pvCaseId: string,
  doctorId: string,
  title: string,
  description?: string,
  requiredFields: string[],
  priority: "P0" | "P1" | "P2",
  dueDate: ISO date string
}
```

### Get Follow-Up Task
```
GET /pv-followups/{taskId}
```

### Update Follow-Up Task
```
PATCH /pv-followups/{taskId}
Body: {
  userId: string,
  status: "PENDING" | "SENT" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "CANCELLED",
  doctorResponse?: {
    data: Record<string, any>,
    notes?: string,
    attachments?: string[]
  }
}
```

---

## Dashboard

### Get Dashboard Statistics
```
GET /pv-dashboard/stats?assignedTo={userId}
Response: {
  stats: {
    totalCases: number,
    openCases: number,
    awaitingFollowUp: number,
    overdueCases: number,
    completedCases: number,
    escalatedCases: number,
    severeCases: number,
    pendingTasks: number,
    overdueTasks: number
  },
  overdueCases: number,
  overdueTasks: number
}
```

---

## Response Format

### Success Response
```json
{
  "ok": true,
  "data": {}
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Server Error |

---

## Query Parameters

### Filtering
- `status` - Case status filter
- `severity` - Severity level filter (SEVERE, MODERATE, MILD)
- `assignedTo` - Filter by assigned officer
- `search` - Search by medicine name or patient

### Pagination
- `skip` - Number of records to skip
- `limit` - Number of records to return (default: 50)

### Options
- `limit` - For activity log, max records to return

---

## Common Patterns

### Workflow: Request Follow-Up
1. Identify case needs more information
2. POST /pv-followups to create task
3. Activity logged: FOLLOWUP_CREATED
4. Doctor receives notification
5. Doctor submits response (via their API)
6. PATCH /pv-followups/:id to mark complete
7. Activity logged: FOLLOWUP_COMPLETED

### Workflow: Escalate Case
1. Identify critical safety signal
2. POST /pv-cases/:id/escalate
3. Activity logged: CASE_ESCALATED
4. Safety Lead receives notification
5. Case status: ESCALATED
6. Safety Lead takes action

### Workflow: Complete Case
1. All follow-ups received and reviewed
2. PATCH /pv-cases/:id with status=COMPLETED
3. Activity logged: CASE_STATUS_UPDATED
4. Ready for export/submission

---

## Example Requests

### Create Follow-Up Task
```bash
curl -X POST http://localhost:3000/api/pv-followups \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "pv-officer-123",
    "pvCaseId": "case-456",
    "doctorId": "doctor-789",
    "title": "Request Laboratory Results",
    "description": "Need complete blood work to assess severity",
    "requiredFields": ["CBC", "Liver Function", "Kidney Function"],
    "priority": "P1",
    "dueDate": "2024-02-15T00:00:00Z"
  }'
```

### Escalate Case
```bash
curl -X POST http://localhost:3000/api/pv-cases/case-456/escalate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "pv-officer-123",
    "escalationReason": "Severe outcome: Hospitalization required",
    "priority": "P0",
    "requiredActions": ["Regulatory notification", "Post-market surveillance"]
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:3000/api/pv-dashboard/stats?assignedTo=pv-officer-123
```

---

## Authentication

All requests must include user context:
- Logged-in user from session
- Validate role: PV_OFFICER or SAFETY_LEAD
- User ID included in request body for activity logging

---

## Activity Log Action Types

| Action | When | Logged Data |
|--------|------|-------------|
| CASE_CREATED | Case escalated to PV | Case ID, Officer |
| CASE_ASSIGNED | Case assigned to officer | Officer ID |
| CASE_STATUS_UPDATED | Status changed | Old status, New status |
| CASE_ESCALATED | Case escalated to Safety Lead | Reason, Priority |
| CASE_CLOSED | Case completed | Notes |
| FOLLOWUP_CREATED | Follow-up task created | Task ID, Doctor, Fields |
| FOLLOWUP_SENT | Task sent to doctor | Task ID, Doctor |
| FOLLOWUP_COMPLETED | Doctor submitted response | Task ID, Data |
| FOLLOWUP_OVERDUE | Task past due date | Task ID, Due date |
| NOTE_ADDED | Note added to case | Note content |
| CASE_EXPORTED | Case exported for submission | Export data |

---

## Case Status Reference

| Status | Description | Actions Available |
|--------|-------------|------------------|
| UNDER_REVIEW | Initial status | Request Follow-Up, Escalate, Add Note |
| FOLLOWUP_REQUESTED | Follow-up sent to doctor | Create Tasks, Escalate, Add Note |
| COMPLETED | All info collected | Export, Escalate, Add Note |
| ESCALATED | Escalated to Safety Lead | View, Add Note |
| EXPORTED | Ready for submission | View only |

---

## Follow-Up Task Status Reference

| Status | Description | Auto-Transition |
|--------|-------------|------------------|
| PENDING | Created, awaiting send | OVERDUE (if past due date) |
| SENT | Notification sent to doctor | IN_PROGRESS (when doctor opens) |
| IN_PROGRESS | Doctor started filling | COMPLETED (when submitted) |
| COMPLETED | Doctor submitted response | - |
| OVERDUE | Past due date | - (manual review) |
| CANCELLED | PV officer cancelled | - (terminal) |

---

## Priority Levels

| Level | Urgency | SLA | Typical Use |
|-------|---------|-----|------------|
| P0 | Critical | 24 hours | Serious adverse events, deaths |
| P1 | High | 3-5 days | Moderate severity, complications |
| P2 | Normal | 1-2 weeks | Mild events, routine follow-ups |

---

## Error Codes

| Error | HTTP | Cause |
|-------|------|-------|
| Missing required fields | 400 | Incomplete request body |
| Case not found | 404 | Invalid case ID |
| Unauthorized | 401 | Not logged in |
| Access denied | 403 | Not PV_OFFICER or SAFETY_LEAD |
| Database error | 500 | Unexpected server error |

---

## Tips & Best Practices

1. **Always include userId** - Required for audit logging
2. **Check activity log** - Verify all actions completed successfully
3. **Monitor overdue cases** - Use dashboard stats regularly
4. **Set appropriate priority** - Matches SLA expectations
5. **Document reasons** - Add notes when escalating or updating status
6. **Batch operations** - Consider using MongoDB aggregation for large datasets
7. **Error handling** - Always check response status before processing data
8. **Timestamps** - All timestamps are UTC ISO format

---

## Rate Limiting

Currently no rate limiting. Recommended for production:
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Webhook Events (Future)

Planned webhook notifications:
- case_escalated
- followup_overdue
- task_completed
- case_status_changed

---

For detailed documentation, see [docs/pv-officer-module.md](docs/pv-officer-module.md)
