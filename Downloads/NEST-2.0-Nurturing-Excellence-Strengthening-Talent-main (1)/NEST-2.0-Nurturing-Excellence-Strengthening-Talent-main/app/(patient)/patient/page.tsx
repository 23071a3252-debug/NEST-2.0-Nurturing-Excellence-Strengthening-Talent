"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { ReportListItem } from "@/types/report";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Timeline from "@/components/ui/Timeline";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?createdByUserId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report details");
      }
      const data = await response.json();
      setSelectedReport(data.report); // Extract the report from the response
      // Audit logs will be loaded from API in future
      setAuditLogs([]);
    } catch (error) {
      console.error("Error fetching report details:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "MILD":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "MODERATE":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      case "SEVERE":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute allowedRoles={[Role.PATIENT]}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Problem Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and track your submitted reports
            </p>
          </div>
          <Link href="/report">
            <Button variant="primary">+ Submit New Report</Button>
          </Link>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            title={loading ? "Loading..." : "No Reports Yet"}
            description={loading ? "Fetching your reports..." : "You haven't submitted any problem reports. Click the button above to submit your first report."}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleViewReport(report.id)}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(
                            report.severity
                          )}`}
                        >
                          {report.severity}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {report.medicineName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {report.symptomDescription}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(new Date(report.createdAt))}
                  </div>
                </Card>
                </div>
              ))}
            </div>

            {/* Report Detail */}
            {selectedReport ? (
              <div className="space-y-4">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Report Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Medicine</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedReport.questionnaire.medicineName}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Symptom</span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedReport.questionnaire.symptoms}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dose & Duration</span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedReport.questionnaire.doseDuration}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Condition</span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedReport.questionnaire.currentCondition}
                      </p>
                    </div>
                    {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Attached Image</span>
                        <div className="mt-2">
                          <img
                            src={selectedReport.attachments[0].url}
                            alt="Report attachment"
                            className="rounded-lg max-w-full h-auto border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      </div>
                    )}
                    {selectedReport.doctorReply && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Doctor&apos;s Response
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Assessment</span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedReport.doctorReply.doctorAssessment}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Action Taken</span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedReport.doctorReply.actionTaken}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Advice</span>
                              <p className="text-gray-900 dark:text-white">
                                {selectedReport.doctorReply.adviceGiven}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Activity Timeline
                  </h3>
                  <Timeline logs={auditLogs} />
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a report to view details
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
