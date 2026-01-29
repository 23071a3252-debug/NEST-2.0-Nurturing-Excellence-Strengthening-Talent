"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function TaskDetailPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
      <div>
        <Card>
          <EmptyState
            title="Task System Disabled"
            description="Mock data has been removed. This feature will be re-enabled once API integration is complete."
          />
          <div className="mt-6 flex justify-center">
            <Link href="/doctor">
              <Button variant="primary">
                 Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}