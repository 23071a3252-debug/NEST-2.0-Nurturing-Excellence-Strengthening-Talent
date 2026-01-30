"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { PVCaseListItem } from "@/types/pv";

interface PVCaseCardProps {
  pvCase: PVCaseListItem;
  onClick?: () => void;
}

export function PVCaseCard({ pvCase, onClick }: PVCaseCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "SEVERE":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800";
      case "MODERATE":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800";
      case "MILD":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNDER_REVIEW":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "NEEDS_FOLLOWUP":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      case "FOLLOWUP_REQUESTED":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300";
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "EXPORTED":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const colorBorder = {
    SEVERE: "border-l-4 border-l-red-500",
    MODERATE: "border-l-4 border-l-orange-500",
    MILD: "border-l-4 border-l-yellow-500",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const caseId = `PV-SE-${String(pvCase.id).slice(-3).padStart(3, "0")}`;

  return (
    <Link href={`/pv/cases/${pvCase.id}`}>
      <Card
        className={`hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 ${
          colorBorder[pvCase.severity as keyof typeof colorBorder] || ""
        }`}
      >
        <div className="p-6 lg:p-8">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getSeverityColor(
                pvCase.severity
              )}`}
            >
              {pvCase.severity}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(
                pvCase.status
              )}`}
            >
              {pvCase.status.replace(/_/g, " ")}
            </span>
            {pvCase.missingFieldsCount > 0 && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 flex items-center gap-1.5 border border-yellow-300 dark:border-yellow-800">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {pvCase.missingFieldsCount} MISSING
              </span>
            )}
            {pvCase.hasFollowup && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                FOLLOW-UP SENT
              </span>
            )}
          </div>

          {/* Medicine Name - Large and Prominent */}
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {pvCase.medicineName}
          </h3>

          {/* Details Grid - More Spacing */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Case ID
              </p>
              <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                {caseId}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Severity
              </p>
              <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                {pvCase.severity}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                {pvCase.status.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                {formatDate(pvCase.createdAt)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Escalated by <span className="font-semibold text-gray-700 dark:text-gray-300">{pvCase.escalatedBy}</span>
            </p>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
}
