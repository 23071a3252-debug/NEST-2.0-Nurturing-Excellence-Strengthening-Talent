# PharmaVigil Demo Guide

## Overview
This is a comprehensive pharmacovigilance follow-up system MVP with offline support, risk assessment, audit logging, and role-based access control.

## Demo Users

### PV Officer
- **Email**: pv@demo.com
- **OTP**: 123456
- **Access**: Cases dashboard, trigger follow-ups, view submissions

### Doctor
- **Email**: doctor@demo.com
- **OTP**: 123456
- **Access**: Follow-up tasks, submit responses

### Safety Lead
- **Email**: safety@demo.com
- **OTP**: 123456
- **Access**: Review cases, oversight

### Admin
- **Email**: admin@demo.com
- **OTP**: 123456
- **Access**: All portals

## Demo Flow

### 1. PV Officer Triggers Follow-Up

1. Login as PV Officer (pv@demo.com / 123456)
2. Navigate to PV Dashboard
3. Click on a case (e.g., AE-2024-001)
4. Review case details:
   - Patient demographics
   - Event description
   - Severity and priority
   - Completeness score
5. Scroll to "Risk Assessment & Triage" section
6. Click "Trigger Follow-Up" button
7. Fill out follow-up task form:
   - Select doctor from dropdown
   - Set priority (P0/P1/P2)
   - Add notes
8. Submit the task
9. See success notification with follow-up link
10. Observe audit log entry for task creation

### 2. Doctor Receives and Completes Task

1. Logout from PV account
2. Login as Doctor (doctor@demo.com / 123456)
3. View "My Tasks" dashboard with task statistics
4. Filter tasks by status (Pending/In Progress/Submitted/Completed)
5. Click on a task to open the follow-up form
6. Start filling the form:
   - Patient contact details
   - Event timeline
   - Medical history
   - Current medications
   - Concomitant medications
   - Lab results
   - Narrative description
7. Observe auto-save every 3 seconds (draft saved to localStorage)
8. Optionally refresh page to see draft restoration with blue notice banner
9. Complete all required fields
10. Submit the form
11. See success confirmation

### 3. PV Officer Reviews Submission

1. Logout and login as PV Officer (pv@demo.com / 123456)
2. Navigate to the case
3. Scroll to "Follow-Up History" section
4. View submitted response with:
   - Submission timestamp
   - Doctor name
   - All form fields with answers
   - Complete medical details
5. Review audit timeline showing:
   - Case opened
   - Task created
   - Task submitted
   - Timestamps and user actions

## Key Features Demo

### Offline Draft Support
1. Login as Doctor
2. Open any pending task
3. Start filling the form
4. Wait 3 seconds (auto-save triggers)
5. Close browser or refresh page
6. Reopen the same task
7. See blue "Draft restored" banner
8. Draft is auto-loaded with all your previous entries
9. Continue editing or submit
10. Draft is cleared after successful submission

### Risk Assessment & Triage
1. Login as PV Officer
2. Open any case
3. View "Risk Assessment & Triage" card
4. Observe:
   - Auto-calculated priority (P0 High/P1 Medium/P2 Low)
   - Completeness score (e.g., 65%)
   - Follow-up recommendation
   - Trigger button when follow-up is recommended

### Audit Logging
1. Login as PV Officer
2. Open any case that has activity
3. Scroll to "Activity Timeline" section
4. View chronological audit log with:
   - Event type (Case Opened, Task Created, Form Submitted, etc.)
   - Actor (who performed the action)
   - Timestamp (relative time)
   - Metadata (additional details)
   - Color-coded icons by event type

### Notification Service
1. Trigger a follow-up as PV Officer
2. See green success banner with notification details:
   - "Follow-up link sent to Dr. Sarah Johnson"
   - Mock email notification logged
3. In production, swap mock provider with SendGrid/Twilio via ENV variable

### Empty States
1. Login as Doctor
2. Filter tasks to "Completed"
3. If no completed tasks, see EmptyState component:
   - Icon (tasks/cases)
   - Title ("No completed tasks")
   - Description (helpful guidance)

### Loading States
1. Navigate between pages
2. Observe loading spinners with text:
   - "Loading your tasks..."
   - "Loading cases..."
   - "Loading case details..."

### Role-Based Navigation
1. Login as different users
2. Observe navbar changes:
   - **Doctor**: "My Tasks" link
   - **PV Officer**: "PV Dashboard" link
   - **Admin**: "Admin", "Cases" links
3. Logo and branding consistent across roles

### Demo Reset
1. Click "Reset Demo" button in top navbar (orange button)
2. Confirm reset in modal dialog
3. All data resets:
   - Tasks reset to initial state
   - Submissions cleared
   - Audit logs reinitialized
   - localStorage drafts cleared
4. Redirected to home page

## Technical Features

### TypeScript
- Strict type checking
- Comprehensive interfaces for all entities
- Enums for status, priority, severity, roles

### Next.js 14 App Router
- Server Components
- Route groups: (auth), (doctor), (pv), (admin)
- Dynamic routes: /cases/[caseId], /tasks/[taskId]
- Loading and error states

### TailwindCSS
- Utility-first styling
- Dark mode support (system preference)
- Responsive design
- Custom components (Card, Button, Timeline, EmptyState)

### State Management
- React Context for authentication
- localStorage for offline drafts
- Mock data store with in-memory state

### Build Optimization
- Production build successful
- Route-based code splitting
- First Load JS optimized
- Static pre-rendering where possible

## Production Deployment Checklist

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=https://pharmavigil.com
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_api_key_here
DATABASE_URL=postgresql://...
```

### Database Migration
1. Replace `lib/data/mock-data.ts` with API calls
2. Set up PostgreSQL/MySQL database
3. Create tables for users, cases, tasks, submissions, audit_logs
4. Implement ORM (Prisma/Drizzle)

### Email Service
1. Install `@sendgrid/mail` package
2. Configure SendGrid API key
3. Update `lib/notify.ts` to use SendGrid provider
4. Test email templates

### Security
- Add CSRF protection
- Implement rate limiting
- Sanitize user inputs
- Add helmet.js for HTTP headers
- Enable HTTPS only

### Testing
- Unit tests for risk calculations
- Integration tests for form submission
- E2E tests for full demo flow
- Test offline draft persistence

### Monitoring
- Add error tracking (Sentry)
- Set up logging (Winston/Pino)
- Monitor API performance
- Track user analytics

## Support
For issues or questions, contact the development team.

---
**Version**: 1.0.0  
**Last Updated**: January 2026  
**Framework**: Next.js 14.2.35 + TypeScript + TailwindCSS
