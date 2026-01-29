"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DoctorReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const reportId = params.id as string;

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyForm, setReplyForm] = useState({
    doctorAssessment: "",
    actionTaken: "",
    adviceGiven: "",
    needsEscalation: false,
  });

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }
      const data = await response.json();
      setReport(data.report); // Extract the report from the response
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !report) return;

    try {
      setSubmitting(true);
      
      // Submit reply to API
      const response = await fetch(`/api/reports/${report.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: user.id,
          ...replyForm,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      // Refresh the report
      await fetchReport();
      
      // Reset form
      setReplyForm({
        doctorAssessment: "",
        actionTaken: "",
        adviceGiven: "",
        needsEscalation: false,
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500">Loading report...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!report) {
    return (
      <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500">Report not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                report.questionnaire.severity
              )}`}
            >
              {report.questionnaire.severity}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                report.status
              )}`}
            >
              {report.status.replace(/_/g, " ")}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Patient Report: {report.questionnaire.medicineName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submitted on {new Date(report.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Patient Information
              </h2>
              <div className="space-y-3">
                {report.patientInfo?.name && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {report.patientInfo.name}
                    </p>
                  </div>
                )}
                {report.patientInfo?.age && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Age</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {report.patientInfo.age} years
                    </p>
                  </div>
                )}
                {report.patientInfo?.contact && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {report.patientInfo.contact}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Symptom Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Medicine Name</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {report.questionnaire.medicineName}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Symptom Description</span>
                  <p className="text-gray-900 dark:text-white">
                    {report.questionnaire.symptoms}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">When Started</span>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(report.questionnaire.startTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Severity</span>
                  <p className="text-gray-900 dark:text-white">
                    {report.questionnaire.severity}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dose & Duration</span>
                  <p className="text-gray-900 dark:text-white">
                    {report.questionnaire.doseDuration}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Condition</span>
                  <p className="text-gray-900 dark:text-white">
                    {report.questionnaire.currentCondition}
                  </p>
                </div>
                {report.questionnaire.additionalNotes && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Additional Notes</span>
                    <p className="text-gray-900 dark:text-white">
                      {report.questionnaire.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Attached Image */}
            {report.attachments && report.attachments.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Attached Image
                </h2>
                <img
                  src={report.attachments[0].url}
                  alt="Report attachment"
                  className="rounded-lg max-w-full h-auto border border-gray-200 dark:border-gray-700"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {report.attachments[0].filename}
                </p>
              </Card>
            )}

            {/* Doctor's Previous Reply */}
            {report.doctorReply && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Your Previous Response
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Assessment</span>
                    <p className="text-gray-900 dark:text-white">
                      {report.doctorReply.doctorAssessment}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Action Taken</span>
                    <p className="text-gray-900 dark:text-white">
                      {report.doctorReply.actionTaken}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Advice Given</span>
                    <p className="text-gray-900 dark:text-white">
                      {report.doctorReply.adviceGiven}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Responded At</span>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(report.doctorReply.repliedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div>
            {!report.doctorReply && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Actions
                </h2>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => router.push(`/doctor/reports/${report.id}/reply`)}
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Respond to Patient
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => router.push(`/doctor/reports/${report.id}/escalate`)}
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Escalate to PV Team
                  </Button>
                </div>
              </Card>
            )}

            {report.doctorReply && report.status !== "ESCALATED_TO_PV" && report.status !== "ESCALATION_DRAFT" && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Escalate to PV
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If this case requires pharmacovigilance review, complete the escalation questionnaire.
                </p>
                <Button
                  variant="primary"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push(`/doctor/reports/${report.id}/escalate`)}
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Escalate to PV Team
                </Button>
              </Card>
            )}

            {(report.status === "ESCALATED_TO_PV" || report.status === "ESCALATION_DRAFT") && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Escalation Status
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {report.status === "ESCALATION_DRAFT" ? "Escalation Draft Saved" : "Escalated to PV Team"}
                    </span>
                  </div>
                  {report.escalation && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Escalated on {new Date(report.escalation.escalatedAt).toLocaleDateString()}</p>
                      <p className="mt-2">The PV team is reviewing this case.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
