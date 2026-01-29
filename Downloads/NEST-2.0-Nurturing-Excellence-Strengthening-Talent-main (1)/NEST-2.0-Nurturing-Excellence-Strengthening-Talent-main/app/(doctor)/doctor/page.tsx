"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role, Priority } from "@/types";
import { ReportListItem } from "@/types/report";
import { Followup } from "@/types/pv";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function DoctorPage() {
  const { user } = useAuth();
  const [patientReports, setPatientReports] = useState<ReportListItem[]>([]);
  const [escalations, setEscalations] = useState<ReportListItem[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load incoming patient reports (not escalated)
      const reportsResponse = await fetch(
        `/api/reports?linkedDoctorId=${user.id}&status=SENT_TO_DOCTOR,DOCTOR_REPLIED`
      );
      if (reportsResponse.ok) {
        const reports = await reportsResponse.json();
        setPatientReports(reports);
      }

      // Load escalations (my escalated reports)
      const escalationsResponse = await fetch(
        `/api/reports?linkedDoctorId=${user.id}&status=ESCALATION_DRAFT,ESCALATED_TO_PV`
      );
      if (escalationsResponse.ok) {
        const escData = await escalationsResponse.json();
        setEscalations(escData);
      }

      // Load follow-ups assigned to me
      const followupsResponse = await fetch(`/api/followups?doctorId=${user.id}`);
      if (followupsResponse.ok) {
        const followupsData = await followupsResponse.json();
        setFollowups(followupsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setPatientReports([]);
      setEscalations([]);
      setFollowups([]);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.P0:
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800";
      case Priority.P1:
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800";
      case Priority.P2:
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to get priority from severity for patient reports
  const getPriorityFromSeverity = (severity: string): Priority => {
    switch (severity) {
      case "SEVERE":
        return Priority.P0;
      case "MODERATE":
        return Priority.P1;
      case "MILD":
      default:
        return Priority.P2;
    }
  };

  // Helper to get status color for patient reports
  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
      case "SENT_TO_DOCTOR":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "DOCTOR_REPLIED":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "ESCALATED_TO_PV":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
      case "CLOSED":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Doctor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage patient reports, escalations, and PV follow-up requests.
          </p>
        </div>

        {/* Section 1: Incoming Patient Reports */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                1. Incoming Patient Reports
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                New adverse event reports waiting for your medical review and response.
              </p>
            </div>
            <Link href="/doctor/report">
              <Button variant="primary">
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Report New Case
              </Button>
            </Link>
          </div>
          
          {patientReports.length === 0 ? (
            <Card>
              <EmptyState
                title="No Patient Reports"
                description="You don&apos;t have any incoming patient reports at this time."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {patientReports.map((report) => {
                const reportPriority = getPriorityFromSeverity(report.severity);
                const reportId = `REPORT-${report.id.split('-').pop()}`;
                
                return (
                  <Link key={report.id} href={`/doctor/reports/${report.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                                reportPriority
                              )}`}
                            >
                              {reportPriority}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getReportStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status.replace(/_/g, " ")}
                            </span>
                            {report.createdByRole === "PATIENT" && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300">
                                PATIENT-REPORTED
                              </span>
                            )}
                            {report.hasImage && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                HAS PHOTO
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {report.medicineName}
                          </h3>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Report ID:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {reportId}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Patient:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {report.patientName?.split(" ").map(n => n[0]).join("") || "Self"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Severity:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {report.severity}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatDate(new Date(report.createdAt))}
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
                            {report.symptomDescription.length > 120
                              ? report.symptomDescription.substring(0, 120) + "..."
                              : report.symptomDescription}
                          </p>

                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            Created {formatTime(new Date(report.createdAt))}
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
              })}
            </div>
          )}
        </div>

        {/* Section 2: My Escalations */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                2. My Escalations
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Cases you&apos;ve escalated to the PV team, including drafts and submitted escalations.
              </p>
            </div>
          </div>
          
          {escalations.length === 0 ? (
            <Card>
              <EmptyState
                title="No Escalations"
                description="You haven&apos;t escalated any cases to the PV team yet."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {escalations.map((report) => {
                const reportPriority = getPriorityFromSeverity(report.severity);
                const reportId = `REPORT-${report.id.split('-').pop()}`;
                
                return (
                  <Link key={report.id} href={`/doctor/reports/${report.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                                reportPriority
                              )}`}
                            >
                              {reportPriority}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getReportStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {report.medicineName}
                          </h3>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Report ID:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {reportId}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Severity:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {report.severity}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Escalated:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatDate(new Date(report.createdAt))}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Status:</span>
                              <p className="font-medium text-purple-600 dark:text-purple-400">
                                {report.status === "ESCALATION_DRAFT" ? "DRAFT" : "WITH PV"}
                              </p>
                            </div>
                          </div>
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
              })}
            </div>
          )}
        </div>

        {/* Section 3: PV Follow-up Requests */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                3. PV Follow-up Requests
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Additional information requests from the PV team for escalated cases.
              </p>
            </div>
          </div>
          
          {followups.length === 0 ? (
            <Card>
              <EmptyState
                title="No Follow-up Requests"
                description="You don&apos;t have any follow-up requests from the PV team."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {followups.map((followup) => (
                <Link key={followup.id} href={`/doctor/followups/${followup.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              followup.status === "PENDING"
                                ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                                : followup.status === "SUBMITTED"
                                ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {followup.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                            {followup.requestedFields.length} FIELDS REQUESTED
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Follow-up Request for Case #{followup.pvCaseId.slice(-6)}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Requested:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(new Date(followup.createdAt))}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Fields:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {followup.requestedFields.join(", ")}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <p className="font-medium text-amber-600 dark:text-amber-400">
                              {followup.status === "PENDING" ? "AWAITING RESPONSE" : "COMPLETED"}
                            </p>
                          </div>
                        </div>

                        {followup.requestNotes && (
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
                            {followup.requestNotes}
                          </p>
                        )}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
