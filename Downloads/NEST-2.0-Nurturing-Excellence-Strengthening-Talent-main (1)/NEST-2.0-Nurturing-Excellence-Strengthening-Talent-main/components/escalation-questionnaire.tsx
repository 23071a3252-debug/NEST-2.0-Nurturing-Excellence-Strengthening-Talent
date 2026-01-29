"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { EscalationAnswers } from "@/types/report";

interface EscalationQuestionnaireProps {
  reportId: string;
  doctorId: string;
  onSuccess?: (pvCaseId: string) => void;
  onCancel?: () => void;
}

export function EscalationQuestionnaire({
  reportId,
  doctorId,
  onSuccess,
  onCancel,
}: EscalationQuestionnaireProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<EscalationAnswers>({
    suspectedADR: "",
    seriousness: {
      isFatal: false,
      isLifeThreatening: false,
      requiresHospitalization: false,
      causesDisability: false,
      other: "",
    },
    actionTaken: "",
    outcome: "UNKNOWN",
    reporterType: "HEALTHCARE_PROFESSIONAL",
    additionalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.suspectedADR.trim()) {
      setError("Please describe the suspected adverse drug reaction");
      return;
    }

    if (!formData.actionTaken.trim()) {
      setError("Please describe the action taken");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/reports/${reportId}/escalate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          escalatedBy: doctorId,
          escalationAnswers: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to escalate report");
      }

      setSuccess(true);

      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.pvCaseId);
        }
      }, 1500);
    } catch (err) {
      console.error("Error escalating report:", err);
      setError(err instanceof Error ? err.message : "Failed to escalate report");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-3xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Report Escalated Successfully</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The case has been created and assigned to the PV team for review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Escalation Questionnaire</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please provide detailed information about this adverse drug reaction for PV review
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Suspected ADR */}
          <div className="space-y-2">
            <label htmlFor="suspectedADR" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Suspected Adverse Drug Reaction *
            </label>
            <textarea
              id="suspectedADR"
              placeholder="Describe the suspected adverse drug reaction in detail..."
              value={formData.suspectedADR}
              onChange={(e) =>
                setFormData({ ...formData, suspectedADR: e.target.value })
              }
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Seriousness Criteria */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Seriousness Criteria</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select all that apply to this case:
            </p>
            <div className="space-y-3 pl-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fatal"
                  checked={formData.seriousness.isFatal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seriousness: {
                        ...formData.seriousness,
                        isFatal: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="fatal" className="text-sm font-medium leading-none cursor-pointer">
                  Fatal (resulted in death)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lifeThreatening"
                  checked={formData.seriousness.isLifeThreatening}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seriousness: {
                        ...formData.seriousness,
                        isLifeThreatening: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="lifeThreatening" className="text-sm font-medium leading-none cursor-pointer">
                  Life-threatening
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hospitalization"
                  checked={formData.seriousness.requiresHospitalization}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seriousness: {
                        ...formData.seriousness,
                        requiresHospitalization: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="hospitalization" className="text-sm font-medium leading-none cursor-pointer">
                  Requires or prolongs hospitalization
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="disability"
                  checked={formData.seriousness.causesDisability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seriousness: {
                        ...formData.seriousness,
                        causesDisability: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="disability" className="text-sm font-medium leading-none cursor-pointer">
                  Results in persistent or significant disability/incapacity
                </label>
              </div>

              <div className="space-y-2 pl-2">
                <label htmlFor="otherSeriousness" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Other (please specify)
                </label>
                <textarea
                  id="otherSeriousness"
                  placeholder="Any other important medical events..."
                  value={formData.seriousness.other || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seriousness: {
                        ...formData.seriousness,
                        other: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Action Taken */}
          <div className="space-y-2">
            <label htmlFor="actionTaken" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Action Taken *
            </label>
            <textarea
              id="actionTaken"
              placeholder="Describe actions taken (e.g., drug withdrawn, dose reduced, treatment given)..."
              value={formData.actionTaken}
              onChange={(e) =>
                setFormData({ ...formData, actionTaken: e.target.value })
              }
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Outcome *</label>
            <div className="space-y-2 pl-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="RECOVERED"
                  id="recovered"
                  checked={formData.outcome === "RECOVERED"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outcome: e.target.value as EscalationAnswers["outcome"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="recovered" className="text-sm cursor-pointer">
                  Recovered/Resolved
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="RECOVERING"
                  id="recovering"
                  checked={formData.outcome === "RECOVERING"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outcome: e.target.value as EscalationAnswers["outcome"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="recovering" className="text-sm cursor-pointer">
                  Recovering/Resolving
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="NOT_RECOVERED"
                  id="notRecovered"
                  checked={formData.outcome === "NOT_RECOVERED"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outcome: e.target.value as EscalationAnswers["outcome"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="notRecovered" className="text-sm cursor-pointer">
                  Not Recovered/Not Resolved
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="FATAL"
                  id="fatalOutcome"
                  checked={formData.outcome === "FATAL"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outcome: e.target.value as EscalationAnswers["outcome"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="fatalOutcome" className="text-sm cursor-pointer">
                  Fatal
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="UNKNOWN"
                  id="unknown"
                  checked={formData.outcome === "UNKNOWN"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outcome: e.target.value as EscalationAnswers["outcome"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="unknown" className="text-sm cursor-pointer">
                  Unknown
                </label>
              </div>
            </div>
          </div>

          {/* Reporter Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Reporter Type *</label>
            <div className="space-y-2 pl-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="HEALTHCARE_PROFESSIONAL"
                  id="hcp"
                  checked={formData.reporterType === "HEALTHCARE_PROFESSIONAL"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reporterType: e.target.value as EscalationAnswers["reporterType"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="hcp" className="text-sm cursor-pointer">
                  Healthcare Professional
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="PATIENT"
                  id="patient"
                  checked={formData.reporterType === "PATIENT"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reporterType: e.target.value as EscalationAnswers["reporterType"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="patient" className="text-sm cursor-pointer">
                  Patient
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="RELATIVE"
                  id="relative"
                  checked={formData.reporterType === "RELATIVE"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reporterType: e.target.value as EscalationAnswers["reporterType"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="relative" className="text-sm cursor-pointer">
                  Relative/Caregiver
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="OTHER"
                  id="other"
                  checked={formData.reporterType === "OTHER"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reporterType: e.target.value as EscalationAnswers["reporterType"],
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="other" className="text-sm cursor-pointer">
                  Other
                </label>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label htmlFor="additionalNotes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              placeholder="Any additional information relevant to this case..."
              value={formData.additionalNotes || ""}
              onChange={(e) =>
                setFormData({ ...formData, additionalNotes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {error && (
            <div className="p-4 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-md flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Escalation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
