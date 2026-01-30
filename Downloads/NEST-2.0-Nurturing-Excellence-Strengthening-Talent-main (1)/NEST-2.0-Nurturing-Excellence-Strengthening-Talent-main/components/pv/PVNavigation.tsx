"use client";

import { PVCaseListItem } from "@/types/pv";
import Card from "@/components/ui/Card";

interface PVNavigationProps {
  cases: PVCaseListItem[];
  exampleCases?: Array<{
    name: string;
    status: string;
  }>;
  activities?: Array<{
    type: string;
    title: string;
    description?: string;
    timeAgo: string;
    role?: string;
    priority?: string;
    assigned?: string;
  }>;
}

export function PVNavigation({
  cases,
  exampleCases = [],
  activities = [],
}: PVNavigationProps) {
  const totalCases = cases.length;
  const openCases = cases.filter(
    (c) => c.status === "UNDER_REVIEW" || c.status === "NEEDS_FOLLOWUP"
  ).length;
  const escalatedCases = cases.filter((c) => c.status === "ESCALATED").length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      UNDER_REVIEW: "UNDER REVIEW",
      FOLLOWUP_REQUESTED: "FOLLOWUP REQUESTED",
      ESCALATED: "ESCALATED",
      COMPLETED: "COMPLETED",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNDER_REVIEW":
        return "text-blue-600 bg-blue-50";
      case "FOLLOWUP_REQUESTED":
        return "text-yellow-600 bg-yellow-50";
      case "ESCALATED":
        return "text-red-600 bg-red-50";
      case "COMPLETED":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          PV Navigation
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Quick actions and recent activity
        </p>

        <div className="space-y-3">
          <Card>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Cases
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalCases}
            </div>
          </Card>

          <Card>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Open Cases
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {openCases}
            </div>
          </Card>

          <Card>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Escalated
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {escalatedCases}
            </div>
          </Card>
        </div>
      </div>

      {/* Example Cases */}
      {exampleCases.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Example Cases
          </h3>
          <div className="space-y-2">
            {exampleCases.map((exampleCase, index) => (
              <Card key={index}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {exampleCase.name}
                </p>
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
                    exampleCase.status
                  )}`}
                >
                  {getStatusBadge(exampleCase.status)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {activities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Activity Timeline
          </h3>
          <div className="space-y-4 relative">
            {/* Timeline line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            {activities.map((activity, index) => (
              <div key={index} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600"></div>

                {/* Content */}
                <Card>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {activity.type}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {activity.timeAgo}
                    </span>
                    {activity.role && (
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {activity.role}
                      </span>
                    )}
                  </div>
                  {activity.priority && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Priority: {activity.priority}
                    </p>
                  )}
                  {activity.assigned && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Assigned to: {activity.assigned}
                    </p>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
