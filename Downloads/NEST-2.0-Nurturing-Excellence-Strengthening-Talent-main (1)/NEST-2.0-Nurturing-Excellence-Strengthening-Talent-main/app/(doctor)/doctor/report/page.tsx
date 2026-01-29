"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function DoctorReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Patient Information
    patientName: "",
    patientAge: "",
    patientContact: "",

    // Questionnaire
    medicineName: "",
    symptoms: "",
    startTime: "",
    severity: "MODERATE" as "MILD" | "MODERATE" | "SEVERE",
    doseDuration: "",
    currentCondition: "",
    additionalNotes: "",

    // Doctor to assign
    linkedDoctorId: user?.id || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to submit a report");
      return;
    }

    try {
      setSubmitting(true);

      // Build FormData
      const reportData = new FormData();
      reportData.append("linkedDoctorId", formData.linkedDoctorId || user.id);
      reportData.append("createdByUserId", user.id);
      reportData.append("createdByRole", "DOCTOR");
      reportData.append("symptoms", formData.symptoms);
      reportData.append("startTime", formData.startTime);
      reportData.append("severity", formData.severity);
      reportData.append("medicineName", formData.medicineName);
      reportData.append("doseDuration", formData.doseDuration);
      reportData.append("currentCondition", formData.currentCondition);

      if (formData.additionalNotes) {
        reportData.append("additionalNotes", formData.additionalNotes);
      }

      // Patient info
      if (formData.patientName) {
        reportData.append("patientName", formData.patientName);
      }
      if (formData.patientAge) {
        reportData.append("patientAge", formData.patientAge);
      }
      if (formData.patientContact) {
        reportData.append("patientContact", formData.patientContact);
      }

      // Image
      if (imageFile) {
        reportData.append("image", imageFile);
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        body: reportData,
      });

      const result = await response.json();

      if (result.ok) {
        alert("Report submitted successfully!");
        router.push("/doctor");
      } else {
        throw new Error(result.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
      <div className="max-w-3xl mx-auto">
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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Report New Case (On Behalf of Patient)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit an adverse event report for a patient who cannot self-report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Patient Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Patient Name"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="John Doe"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Age"
                  name="patientAge"
                  type="number"
                  value={formData.patientAge}
                  onChange={handleChange}
                  placeholder="35"
                />
                <Input
                  label="Contact"
                  name="patientContact"
                  value={formData.patientContact}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </Card>

          {/* Medication & Symptoms */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Medication & Symptoms
            </h2>
            <div className="space-y-4">
              <Input
                label="Medicine Name"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleChange}
                placeholder="e.g., Aspirin 500mg"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symptom Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe the adverse event or symptoms..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="When Started"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                  </select>
                </div>
              </div>

              <Input
                label="Dose & Duration"
                name="doseDuration"
                value={formData.doseDuration}
                onChange={handleChange}
                placeholder="e.g., 2 tablets daily for 5 days"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Condition <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="currentCondition"
                  value={formData.currentCondition}
                  onChange={handleChange}
                  placeholder="Describe the patient's current condition..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="Any other relevant information..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>
          </Card>

          {/* Image Upload */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Photo Evidence (Optional)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {imagePreview && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-sm rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
