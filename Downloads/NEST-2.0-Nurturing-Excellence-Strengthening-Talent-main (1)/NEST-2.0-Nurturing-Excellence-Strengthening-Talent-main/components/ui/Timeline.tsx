import { AuditLog, Role } from "@/types";

interface TimelineProps {
  logs: AuditLog[];
}

export default function Timeline({ logs }: TimelineProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "TASK_CREATED":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
          </svg>
        );
      case "TASK_SENT":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        );
      case "TASK_OPENED":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        );
      case "FORM_SUBMITTED":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case "FORM_DRAFT_SAVED":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
        );
      case "STATUS_UPDATED":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case "TASK_ASSIGNED":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "TASK_CREATED":
      case "TASK_SENT":
      case "TASK_ASSIGNED":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
      case "TASK_OPENED":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400";
      case "FORM_SUBMITTED":
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400";
      case "FORM_DRAFT_SAVED":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400";
      case "STATUS_UPDATED":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getActionLabel = (log: AuditLog) => {
    switch (log.actionType) {
      case "TASK_CREATED":
        return "Follow-up task created";
      case "TASK_SENT":
        return "Task sent to doctor";
      case "TASK_OPENED":
        return "Task opened by doctor";
      case "FORM_SUBMITTED":
        return "Follow-up form submitted";
      case "FORM_DRAFT_SAVED":
        return "Draft saved";
      case "STATUS_UPDATED":
        return `Status updated: ${log.metadata?.previousStatus} → ${log.metadata?.newStatus}`;
      case "TASK_ASSIGNED":
        return "Task assigned";
      default:
        return log.actionType.replace(/_/g, " ").toLowerCase();
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.DOCTOR:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case Role.PV_OFFICER:
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case Role.SAFETY_LEAD:
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case Role.ADMIN:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          No activity recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, logIdx) => (
          <li key={log.id}>
            <div className="relative pb-8">
              {logIdx !== logs.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div>
                  <div
                    className={`relative px-1 flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900 ${getActionColor(
                      log.actionType
                    )}`}
                  >
                    {getActionIcon(log.actionType)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getActionLabel(log)}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                        log.actorRole
                      )}`}
                    >
                      {log.actorRole}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(log.timestamp)}
                  </p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {log.metadata.priority && (
                        <span className="inline-flex items-center mr-3">
                          <span className="font-medium">Priority:</span>{" "}
                          <span className="ml-1">{log.metadata.priority}</span>
                        </span>
                      )}
                      {log.metadata.assignedToId && (
                        <span className="inline-flex items-center mr-3">
                          <span className="font-medium">Assigned to:</span>{" "}
                          <span className="ml-1">{log.metadata.assignedToId}</span>
                        </span>
                      )}
                      {log.metadata.responseCount !== undefined && (
                        <span className="inline-flex items-center mr-3">
                          <span className="font-medium">Responses:</span>{" "}
                          <span className="ml-1">{log.metadata.responseCount}</span>
                        </span>
                      )}
                      {log.metadata.notes && (
                        <p className="mt-1 italic text-gray-500 dark:text-gray-500">
                          &quot;{log.metadata.notes}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
