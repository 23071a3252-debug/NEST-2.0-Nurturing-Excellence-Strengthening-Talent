/**
 * PV Activity Log Timeline Component
 * Display audit trail for PV case actions
 */

"use client";

import { PVActivityLog } from "@/types/pv";
import Card from "@/components/ui/Card";

interface PVActivityLogProps {
  logs: PVActivityLog[];
}

export function PVActivityLog({ logs }: PVActivityLogProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "CASE_CREATED":
        return "📋";
      case "CASE_ASSIGNED":
        return "👤";
      case "CASE_STATUS_UPDATED":
        return "🔄";
      case "CASE_ESCALATED":
        return "⚠️";
      case "CASE_CLOSED":
        return "✅";
      case "FOLLOWUP_CREATED":
        return "📝";
      case "FOLLOWUP_SENT":
        return "📤";
      case "FOLLOWUP_COMPLETED":
        return "✔️";
      case "FOLLOWUP_OVERDUE":
        return "⏰";
      case "NOTE_ADDED":
        return "💬";
      case "CASE_EXPORTED":
        return "📦";
      default:
        return "•";
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  if (logs.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No activity recorded yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, idx) => (
        <Card key={idx} className="border-l-4 border-l-gray-400 hover:border-l-purple-500 transition-colors">
          <div className="flex gap-4">
            <div className="text-2xl flex-shrink-0">{getActionIcon(log.actionType)}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {log.description}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {log.actionType.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {formatRelativeTime(log.timestamp)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {log.performedByRole}
                  </p>
                </div>
              </div>

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-2 text-xs space-y-1">
                  {log.metadata.oldStatus && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Status:</span> {log.metadata.oldStatus} → {log.metadata.newStatus}
                    </p>
                  )}
                  {log.metadata.escalationReason && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Reason:</span> {log.metadata.escalationReason}
                    </p>
                  )}
                  {log.metadata.priority && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Priority:</span> {log.metadata.priority}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {formatDate(log.timestamp)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
