"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { ReportWithUrls } from "@/types/report";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ReplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportWithUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [replyForm, setReplyForm] = useState({
    doctorAssessment: "",
    actionTaken: "",
    adviceGiven: "",
  });

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }
      const data = await response.json();
      setReport(data.report);
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
      setError(null);

      const response = await fetch(`/api/reports/${reportId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: user.id,
          doctorAssessment: replyForm.doctorAssessment,
          actionTaken: replyForm.actionTaken,
          adviceGiven: replyForm.adviceGiven,
          needsEscalation: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit response");
      }

      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/doctor");
      }, 2000);
    } catch (error) {
      console.error("Error submitting reply:", error);
      setError("Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!report) {
    return (
      <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Report not found</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (success) {
    return (
      <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                Response Submitted Successfully
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your response has been sent to the patient.
              </p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Report
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Respond to Patient Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Medicine: {report.questionnaire.medicineName} · Severity: {report.questionnaire.severity}
          </p>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Medical Response
          </h2>
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Assessment *
              </label>
              <textarea
                value={replyForm.doctorAssessment}
                onChange={(e) =>
                  setReplyForm({ ...replyForm, doctorAssessment: e.target.value })
                }
                placeholder="Provide your medical assessment of the patient's condition..."
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action Taken *
              </label>
              <textarea
                value={replyForm.actionTaken}
                onChange={(e) =>
                  setReplyForm({ ...replyForm, actionTaken: e.target.value })
                }
                placeholder="Describe what actions you have taken or prescribed..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Advice for Patient *
              </label>
              <textarea
                value={replyForm.adviceGiven}
                onChange={(e) =>
                  setReplyForm({ ...replyForm, adviceGiven: e.target.value })
                }
                placeholder="Provide advice and guidance for the patient..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Response
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
