"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { Followup } from "@/types/pv";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function FollowupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const followupId = params.id as string;

  const [followup, setFollowup] = useState<Followup | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (followupId) {
      fetchFollowup();
    }
  }, [followupId]);

  const fetchFollowup = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/followups/${followupId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch follow-up");
      }
      const data = await response.json();
      setFollowup(data.followup);

      // Initialize responses
      const initialResponses: Record<string, string> = {};
      data.followup.requestedFields.forEach((field: string) => {
        initialResponses[field] = data.followup.doctorResponse?.responses[field] || "";
      });
      setResponses(initialResponses);
      setAdditionalNotes(data.followup.doctorResponse?.additionalNotes || "");
    } catch (error) {
      console.error("Error fetching follow-up:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !followup) return;

    // Validate all fields are filled
    const emptyFields = followup.requestedFields.filter(
      (field) => !responses[field]?.trim()
    );
    if (emptyFields.length > 0) {
      setError(`Please fill in all requested fields: ${emptyFields.join(", ")}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`/api/followups/${followupId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses,
          additionalNotes,
          doctorId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit follow-up");
      }

      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/doctor");
      }, 2000);
    } catch (error) {
      console.error("Error submitting follow-up:", error);
      setError("Failed to submit follow-up. Please try again.");
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

  if (!followup) {
    return (
      <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Follow-up request not found</p>
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
                Follow-up Submitted Successfully
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your response has been sent to the PV team.
              </p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const isAlreadySubmitted = followup.status === "SUBMITTED" || followup.status === "ACKNOWLEDGED";

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
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PV Follow-up Request
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Case #{followup.pvCaseId.slice(-6)} · Requested on{" "}
            {new Date(followup.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {isAlreadySubmitted && (
          <div className="mb-6">
            <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">This follow-up has already been submitted</p>
              </div>
            </Card>
          </div>
        )}

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Request Details
          </h2>
          {followup.requestNotes && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Request Notes from PV Team:
              </p>
              <p className="text-blue-800 dark:text-blue-200">{followup.requestNotes}</p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The PV team has requested the following information:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {followup.requestedFields.map((field, index) => (
                <li key={index} className="text-gray-900 dark:text-white font-medium">
                  {field}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {isAlreadySubmitted ? (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Response
            </h2>
            <div className="space-y-4">
              {followup.requestedFields.map((field, index) => (
                <div key={index}>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field}
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {followup.doctorResponse?.responses[field] || "No response"}
                    </p>
                  </div>
                </div>
              ))}
              {followup.doctorResponse?.additionalNotes && (
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Notes
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {followup.doctorResponse.additionalNotes}
                    </p>
                  </div>
                </div>
              )}
              {followup.doctorResponse?.submittedAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Submitted on{" "}
                  {new Date(followup.doctorResponse.submittedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Provide Response
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {followup.requestedFields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field} *
                  </label>
                  <textarea
                    value={responses[field] || ""}
                    onChange={(e) =>
                      setResponses({ ...responses, [field]: e.target.value })
                    }
                    placeholder={`Please provide information about ${field}...`}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional relevant information..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
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
        )}
      </div>
    </ProtectedRoute>
  );
}
