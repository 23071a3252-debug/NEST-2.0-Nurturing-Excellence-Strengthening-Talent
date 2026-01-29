"use client";

import { useRouter, useParams } from "next/navigation";
import { EscalationQuestionnaire } from "@/components/escalation-questionnaire";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function EscalatePage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  // For demo purposes, using a hardcoded doctor ID
  // In production, get from auth session
  const doctorId = "dr001";

  const handleSuccess = (pvCaseId: string) => {
    // Redirect to doctor dashboard after successful escalation
    setTimeout(() => {
      router.push("/doctor");
    }, 2000);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Report
        </Button>
      </div>

      <EscalationQuestionnaire
        reportId={reportId}
        doctorId={doctorId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
