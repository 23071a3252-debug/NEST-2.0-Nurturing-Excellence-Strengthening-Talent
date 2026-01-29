"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PVCase } from "@/types/pv";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Download, Loader2, Send } from "lucide-react";

interface PVCaseDetailPageProps {
  params: { id: string };
}

export default function PVCaseDetailPage({ params }: PVCaseDetailPageProps) {
  const router = useRouter();
  const [pvCase, setPvCase] = useState<PVCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Followup request form state
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [requestedFields, setRequestedFields] = useState<string[]>([]);
  const [requestNotes, setRequestNotes] = useState("");

  useEffect(() => {
    loadPvCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadPvCase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pv-cases/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPvCase(data.pvCase);
      } else {
        setError("Failed to load PV case");
      }
    } catch (err) {
      console.error("Error loading PV case:", err);
      setError("An error occurred while loading the case");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFollowup = async () => {
    if (!pvCase || requestedFields.length === 0) {
      alert("Please select at least one field to request");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/pv-cases/${params.id}/request-followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedBy: "current-pv-officer", // TODO: Get from auth context
          requestedFields,
          requestNotes,
        }),
      });

      if (response.ok) {
        alert("✓ Case triggered! The doctor has been notified and will provide the missing information.");
        setShowFollowupForm(false);
        setRequestedFields([]);
        setRequestNotes("");
        loadPvCase();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to request follow-up");
      }
    } catch (err) {
      console.error("Error requesting follow-up:", err);
      alert("An error occurred while requesting follow-up");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    if (!pvCase) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/pv-cases/${params.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exportedBy: "current-pv-officer", // TODO: Get from auth context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Download the JSON file
        const blob = new Blob([JSON.stringify(data.exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PV-Case-${params.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert("Case exported successfully!");
        loadPvCase();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to export case");
      }
    } catch (err) {
      console.error("Error exporting case:", err);
      alert("An error occurred while exporting the case");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFieldSelection = (field: string) => {
    setRequestedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const caseId = pvCase ? `PV-${params.id.slice(-6).toUpperCase()}` : "";
  const hasMissingFields = pvCase?.missingFields && pvCase.missingFields.length > 0;
  const canExport = pvCase && !hasMissingFields && pvCase.status !== "EXPORTED";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !pvCase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error || "Case not found"}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">{caseId}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Escalated on {formatDate(pvCase.escalatedAt)}
        </p>
      </div>

      {/* Status and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Status
          </h3>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
            {pvCase.status.replace(/_/g, " ")}
          </span>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Severity
          </h3>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
            {pvCase.sourceReportSnapshot.questionnaire.severity}
          </span>
        </Card>
      </div>

      {/* Missing Fields Alert */}
      {hasMissingFields && (
        <Card className="mb-6 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                Missing Information
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                The following fields are missing and require follow-up:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-800 dark:text-amber-300">
                {pvCase.missingFields.map((field, idx) => (
                  <li key={idx}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Patient Information */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
            <p className="font-medium">
              {pvCase.sourceReportSnapshot.patientInfo?.name || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
            <p className="font-medium">
              {pvCase.sourceReportSnapshot.patientInfo?.age || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
            <p className="font-medium">
              {pvCase.sourceReportSnapshot.patientInfo?.contact || "Not provided"}
            </p>
          </div>
        </div>
      </Card>

      {/* Report Details */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Adverse Event Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Medicine</p>
            <p className="font-medium">
              {pvCase.sourceReportSnapshot.questionnaire.medicineName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Symptoms</p>
            <p className="font-medium">
              {pvCase.sourceReportSnapshot.questionnaire.symptoms}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dose & Duration</p>
            <p className="font-medium">
              {pvCase.sourceReportSnapshot.questionnaire.doseDuration}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Condition</p>
            <p className="font-medium">
              {pvCase.sourceReportSnapshot.questionnaire.currentCondition}
            </p>
          </div>
        </div>
      </Card>

      {/* Escalation Answers */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Escalation Questionnaire</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspected ADR</p>
            <p className="font-medium">{pvCase.escalationAnswers.suspectedADR}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Seriousness</p>
            <ul className="list-disc list-inside font-medium">
              {pvCase.escalationAnswers.seriousness.isFatal && <li>Fatal</li>}
              {pvCase.escalationAnswers.seriousness.isLifeThreatening && (
                <li>Life-threatening</li>
              )}
              {pvCase.escalationAnswers.seriousness.requiresHospitalization && (
                <li>Requires Hospitalization</li>
              )}
              {pvCase.escalationAnswers.seriousness.causesDisability && (
                <li>Causes Disability</li>
              )}
              {pvCase.escalationAnswers.seriousness.other && (
                <li>Other: {pvCase.escalationAnswers.seriousness.other}</li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Action Taken</p>
            <p className="font-medium">{pvCase.escalationAnswers.actionTaken}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Outcome</p>
            <p className="font-medium">
              {pvCase.escalationAnswers.outcome.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Reporter Type</p>
            <p className="font-medium">
              {pvCase.escalationAnswers.reporterType.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Actions</h2>
        <div className="flex flex-col gap-4">
          {!showFollowupForm && pvCase.status !== "EXPORTED" && (
            <Card className="border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                    Trigger Case - Request Additional Information
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
                    Notify the doctor about missing or incomplete information and request them to provide additional details.
                    {hasMissingFields && (
                      <span className="block mt-1 font-semibold">
                        ⚠️ {pvCase.missingFields?.length} field(s) automatically detected as missing
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  onClick={() => setShowFollowupForm(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4" />
                  Trigger Case
                </Button>
              </div>
            </Card>
          )}

          {canExport && (
            <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                    Export Complete Case
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-0">
                    All required information is complete. Export this case for regulatory submission.
                  </p>
                </div>
                <Button
                  onClick={handleExport}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export Case
                </Button>
              </div>
            </Card>
          )}

        {pvCase.status === "EXPORTED" && (
          <Card className="border-l-4 border-l-gray-500">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Case has been exported</span>
            </div>
          </Card>
        )}
        </div>
      </div>

      {/* Follow-up Request Form */}
      {showFollowupForm && (
        <Card className="mt-6 border-2 border-purple-500 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/10">
          <h3 className="text-lg font-bold mb-2 text-purple-900 dark:text-purple-200">
            Trigger Case - Request Additional Information from Doctor
          </h3>
          <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">
            Select the information you need from the doctor or specify custom requirements in the notes below:
          </p>

          {pvCase.missingFields && pvCase.missingFields.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-purple-900 dark:text-purple-200">
                Automatically Detected Missing Fields:
              </p>
              <div className="space-y-2">
                {pvCase.missingFields.map((field) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestedFields.includes(field)}
                      onChange={() => toggleFieldSelection(field)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-purple-900 dark:text-purple-200">
              Custom Fields or Additional Requirements
            </label>
            <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
              Enter any additional fields or information you need (one per line):
            </p>
            <textarea
              value={requestedFields.filter(f => !pvCase.missingFields?.includes(f)).join('\n')}
              onChange={(e) => {
                const customFields = e.target.value.split('\n').filter(f => f.trim());
                const autoFields = pvCase.missingFields?.filter(f => requestedFields.includes(f)) || [];
                setRequestedFields([...autoFields, ...customFields]);
              }}
              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md bg-white dark:bg-gray-800 font-mono text-sm"
              rows={3}
              placeholder="e.g., Detailed allergy history&#10;Lab test results&#10;Previous medication records"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-purple-900 dark:text-purple-200">
              Notes for Doctor
            </label>
            <textarea
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md bg-white dark:bg-gray-800"
              rows={3}
              placeholder="Add specific instructions or explain what information is needed and why..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRequestFollowup}
              disabled={actionLoading || requestedFields.length === 0}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send to Doctor
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowFollowupForm(false);
                setRequestedFields([]);
                setRequestNotes("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
