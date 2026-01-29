"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role, Severity } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const DRAFT_KEY = "patient-report-draft";

export default function PatientReportFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    selectedDoctor: "",
    patientName: "",
    patientAge: "",
    patientContact: "",
    symptomDescription: "",
    startTime: "",
    severity: Severity.MILD,
    medicineName: "",
    doseAndDuration: "",
    currentCondition: "",
    additionalNotes: "",
  });

  // Mock doctors list - will be loaded from API in future
  const doctors = [
    { id: "doc-1", name: "Dr. Sarah Johnson", email: "sarah.j@hospital.com" },
    { id: "doc-2", name: "Dr. Michael Chen", email: "m.chen@clinic.com" },
    { id: "doc-3", name: "Dr. Emily Rodriguez", email: "e.rodriguez@hospital.com" },
  ];

  // Load draft
  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          setFormData(JSON.parse(draft));
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (typeof window !== "undefined" && !submitted) {
      const timer = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, submitted]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.selectedDoctor) {
      alert("Please select a doctor");
      return;
    }

    if (!formData.symptomDescription || !formData.medicineName || !formData.startTime) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Build FormData for multipart upload
      const submitData = new FormData();
      submitData.append('linkedDoctorId', formData.selectedDoctor);
      submitData.append('createdByUserId', user?.id || '');
      submitData.append('symptoms', formData.symptomDescription);
      submitData.append('startTime', formData.startTime);
      submitData.append('severity', formData.severity);
      submitData.append('medicineName', formData.medicineName);
      submitData.append('doseDuration', formData.doseAndDuration);
      submitData.append('currentCondition', formData.currentCondition);
      submitData.append('additionalNotes', formData.additionalNotes);
      
      if (formData.patientName) submitData.append('patientName', formData.patientName);
      if (formData.patientAge) submitData.append('patientAge', formData.patientAge);
      if (formData.patientContact) submitData.append('patientContact', formData.patientContact);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // POST to API
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      // Clear draft and image
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <ProtectedRoute allowedRoles={[Role.PATIENT]}>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Report Submitted Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your report has been sent to the doctor. They will review it and respond soon.
              </p>
              <Button variant="primary" onClick={() => router.push("/patient")}>
                View My Reports
              </Button>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[Role.PATIENT]}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Submit Problem Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Report any adverse effects or problems with your medication
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Doctor
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Doctor *
                </label>
                <select
                  name="selectedDoctor"
                  value={formData.selectedDoctor}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  name="patientContact"
                  value={formData.patientContact}
                  onChange={handleChange}
                  placeholder="Phone or email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Problem Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Aspirin, Cardio-XR"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symptom / Problem Description *
                </label>
                <textarea
                  name="symptomDescription"
                  value={formData.symptomDescription}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your symptoms or the problem you experienced..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    When did it start? *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value={Severity.MILD}>Mild</option>
                    <option value={Severity.MODERATE}>Moderate</option>
                    <option value={Severity.SEVERE}>Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dose & Duration *
                </label>
                <input
                  type="text"
                  name="doseAndDuration"
                  value={formData.doseAndDuration}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 500mg twice daily for 3 days"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Condition *
                </label>
                <textarea
                  name="currentCondition"
                  value={formData.currentCondition}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="How are you feeling now?"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any other information..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Photo Evidence (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/patient")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting} className="flex-1">
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
