"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { PVCaseListItem } from "@/types/pv";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function PVPage() {
  const { user } = useAuth();
  const [pvCases, setPvCases] = useState<PVCaseListItem[]>([]);

  useEffect(() => {
    loadPvCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPvCases = async () => {
    try {
      const response = await fetch('/api/pv-cases');
      if (response.ok) {
        const cases = await response.json();
        setPvCases(cases);
      }
    } catch (error) {
      console.error('Error loading PV cases:', error);
      setPvCases([]);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "SEVERE":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800";
      case "MODERATE":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800";
      case "MILD":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800";
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

  return (
    <ProtectedRoute allowedRoles={[Role.PV_OFFICER, Role.SAFETY_LEAD]}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Pharmacovigilance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review escalated cases, identify missing information, and manage follow-up requests.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Cases
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {pvCases.length}
            </p>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Under Review
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {pvCases.filter(c => c.status === "UNDER_REVIEW" || c.status === "NEEDS_FOLLOWUP").length}
            </p>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Pending Follow-up
            </h3>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pvCases.filter(c => c.status === "FOLLOWUP_REQUESTED").length}
            </p>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Severe Cases
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {pvCases.filter(c => c.severity === "SEVERE").length}
            </p>
          </Card>
        </div>

        {/* PV Cases List */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            PV Cases
          </h2>
        </div>

        <div className="space-y-4">
          {pvCases.length === 0 ? (
            <Card>
              <EmptyState
                icon="cases"
                title="No PV Cases"
                description="No cases have been escalated to PV yet. Escalated cases will appear here for review."
              />
            </Card>
          ) : (
            pvCases.map((pvCase) => {
              const caseId = `PV-${pvCase.id.slice(-6).toUpperCase()}`;
              
              return (
                <Link key={pvCase.id} href={`/pv/cases/${pvCase.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                              pvCase.severity
                            )}`}
                          >
                            {pvCase.severity}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              pvCase.status
                            )}`}
                          >
                            {pvCase.status.replace(/_/g, " ")}
                          </span>
                          {pvCase.missingFieldsCount > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {pvCase.missingFieldsCount} MISSING FIELDS
                            </span>
                          )}
                          {pvCase.hasFollowup && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                              FOLLOW-UP REQUESTED
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {pvCase.medicineName}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Case ID:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {caseId}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Severity:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pvCase.severity}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pvCase.status.replace(/_/g, " ")}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Created:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(new Date(pvCase.createdAt))}
                            </p>
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                          Escalated by Dr. {pvCase.escalatedBy}
                        </p>
                      </div>

                      <div className="ml-4">
                        <svg
                          className="w-6 h-6 text-gray-400"
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
            })
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
