import { FollowUpTask, Role } from "@/types";

/**
 * Notification Service
 * 
 * MVP: Mocked console logging + in-memory storage
 * Production: Swap implementations to use SendGrid (email) or Twilio (SMS)
 */

export interface NotificationChannel {
  type: "EMAIL" | "SMS" | "IN_APP";
  value: string; // email address or phone number
  verified: boolean;
}

export interface NotificationRecord {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: Role;
  channel: NotificationChannel;
  templateType: "FOLLOW_UP_LINK" | "REMINDER" | "STATUS_UPDATE" | "ASSIGNMENT";
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
  sentAt: Date;
  status: "PENDING" | "SENT" | "FAILED" | "DELIVERED" | "READ";
  error?: string;
}

// In-memory notification storage (MVP)
let notifications: NotificationRecord[] = [];

/**
 * Get notification history
 */
export function getNotifications(): NotificationRecord[] {
  return [...notifications].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

/**
 * Get notifications for a specific user
 */
export function getNotificationsByUser(userId: string): NotificationRecord[] {
  return notifications
    .filter((n) => n.recipientId === userId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

/**
 * Get notifications for a specific task
 */
export function getNotificationsByTask(taskId: string): NotificationRecord[] {
  return notifications
    .filter((n) => n.metadata?.taskId === taskId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

/**
 * Clear all notifications (for testing)
 */
export function clearNotifications(): void {
  notifications = [];
}

/**
 * Send follow-up link to doctor
 * 
 * MVP: Logs to console and stores record
 * Production: Replace with SendGrid/Twilio implementation
 */
export async function sendFollowUpLink(
  doctor: { id: string; name: string; email: string },
  task: FollowUpTask,
  caseNumber?: string
): Promise<NotificationRecord> {
  // Construct follow-up link
  const followUpLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tasks/${task.id}`;

  // Prepare email content
  const subject = `New Follow-Up Task: ${caseNumber || task.caseId}`;
  const message = `
Dear Dr. ${doctor.name},

You have been assigned a new follow-up task for case ${caseNumber || task.caseId}.

Priority: ${task.priority}
Due Date: ${new Date(task.dueDate).toLocaleDateString()}
${task.notes ? `Notes: ${task.notes}` : ""}

Please review and complete the follow-up form by accessing the secure link below:
${followUpLink}

This link will remain active until the task is completed or expires.

Thank you for your prompt attention to this matter.

Best regards,
Pharmacovigilance Team
  `.trim();

  // MVP: Console logging (simulates email sending)
  console.log("=".repeat(80));
  console.log("📧 NOTIFICATION SERVICE - FOLLOW-UP LINK");
  console.log("=".repeat(80));
  console.log(`To: ${doctor.email} (${doctor.name})`);
  console.log(`Subject: ${subject}`);
  console.log(`Channel: EMAIL (verified)`);
  console.log(`Task ID: ${task.id}`);
  console.log(`Follow-up Link: ${followUpLink}`);
  console.log("-".repeat(80));
  console.log(message);
  console.log("=".repeat(80));

  // Create notification record
  const notification: NotificationRecord = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    recipientId: doctor.id,
    recipientName: doctor.name,
    recipientRole: Role.DOCTOR,
    channel: {
      type: "EMAIL",
      value: doctor.email,
      verified: true, // MVP: assume verified
    },
    templateType: "FOLLOW_UP_LINK",
    subject,
    message,
    metadata: {
      taskId: task.id,
      caseId: task.caseId,
      caseNumber,
      priority: task.priority,
      dueDate: task.dueDate.toISOString(),
      followUpLink,
    },
    sentAt: new Date(),
    status: "SENT", // MVP: immediate success
  };

  // Store notification
  notifications.push(notification);

  // MVP: Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));

  return notification;
}

/**
 * Send reminder for overdue task
 * 
 * Production: Implement with email/SMS provider
 */
export async function sendReminder(
  doctor: { id: string; name: string; email: string },
  task: FollowUpTask
): Promise<NotificationRecord> {
  const followUpLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tasks/${task.id}`;

  const message = `
Reminder: You have a pending follow-up task (${task.caseId}) that is due soon.

Please complete the follow-up form at: ${followUpLink}
  `.trim();

  console.log("📬 REMINDER:", doctor.email, "-", message);

  const notification: NotificationRecord = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    recipientId: doctor.id,
    recipientName: doctor.name,
    recipientRole: Role.DOCTOR,
    channel: {
      type: "EMAIL",
      value: doctor.email,
      verified: true,
    },
    templateType: "REMINDER",
    subject: `Reminder: Follow-Up Task ${task.caseId}`,
    message,
    metadata: {
      taskId: task.id,
      caseId: task.caseId,
      followUpLink,
    },
    sentAt: new Date(),
    status: "SENT",
  };

  notifications.push(notification);
  await new Promise((resolve) => setTimeout(resolve, 100));

  return notification;
}

/**
 * Send status update notification
 * 
 * Production: Implement with email/SMS provider
 */
export async function sendStatusUpdate(
  recipient: { id: string; name: string; email: string; role: Role },
  taskId: string,
  oldStatus: string,
  newStatus: string
): Promise<NotificationRecord> {
  const message = `Task ${taskId} status updated from ${oldStatus} to ${newStatus}.`;

  console.log("🔔 STATUS UPDATE:", recipient.email, "-", message);

  const notification: NotificationRecord = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    recipientId: recipient.id,
    recipientName: recipient.name,
    recipientRole: recipient.role,
    channel: {
      type: "EMAIL",
      value: recipient.email,
      verified: true,
    },
    templateType: "STATUS_UPDATE",
    subject: `Task Status Update: ${taskId}`,
    message,
    metadata: {
      taskId,
      oldStatus,
      newStatus,
    },
    sentAt: new Date(),
    status: "SENT",
  };

  notifications.push(notification);
  await new Promise((resolve) => setTimeout(resolve, 100));

  return notification;
}

/**
 * Production-ready abstraction for email service
 * Swap this implementation when integrating SendGrid
 */
interface EmailServiceProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

class MockEmailService implements EmailServiceProvider {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(body);
  }
}

class SendGridEmailService implements EmailServiceProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Production implementation:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.apiKey);
    // await sgMail.send({ to, subject, text: body, from: 'noreply@example.com' });
    throw new Error("SendGrid not implemented yet");
  }
}

// Factory for email service (easily swap implementations)
export function getEmailService(): EmailServiceProvider {
  const provider = process.env.EMAIL_PROVIDER || "mock";

  switch (provider) {
    case "sendgrid":
      return new SendGridEmailService(process.env.SENDGRID_API_KEY || "");
    case "mock":
    default:
      return new MockEmailService();
  }
}
