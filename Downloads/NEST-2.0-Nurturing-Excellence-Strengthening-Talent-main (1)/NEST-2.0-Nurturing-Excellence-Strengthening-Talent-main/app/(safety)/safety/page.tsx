"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { PVCaseListItem } from "@/types/pv";
import { useAuth } from "@/components/providers/AuthProvider";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Download, CheckCircle2, FileText } from "lucide-react";

export default function SafetyDashboardPage() {
  const { user } = useAuth();
  const [exportedCases, setExportedCases] = useState<PVCaseListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExportedCases();
  }, []);

  const loadExportedCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pv-cases?status=EXPORTED');
      if (response.ok) {
        const cases = await response.json();
        setExportedCases(cases);
      }
    } catch (error) {
      console.error('Error loading exported cases:', error);
      setExportedCases([]);
    } finally {
      setLoading(false);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "SEVERE":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800";
      case "MODERATE":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800";
      case "MILD":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <ProtectedRoute allowedRoles={[Role.SAFETY_LEAD, Role.ADMIN]}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Safety Officer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review exported cases ready for regulatory submission
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Exported Cases
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {exportedCases.length}
            </p>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Severe Cases
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {exportedCases.filter(c => c.severity === "SEVERE").length}
            </p>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              This Month
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {exportedCases.filter(c => {
                const caseDate = new Date(c.createdAt);
                const now = new Date();
                return caseDate.getMonth() === now.getMonth() && 
                       caseDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </Card>
        </div>

        {/* Exported Cases List */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Exported Cases
          </h2>
        </div>

        {loading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {exportedCases.length === 0 ? (
              <Card>
                <EmptyState
                  icon="cases"
                  title="No Exported Cases"
                  description="No cases have been exported yet. Exported cases will appear here for regulatory submission."
                />
              </Card>
            ) : (
              exportedCases.map((pvCase) => {
                const caseId = `PV-${pvCase.id.slice(-6).toUpperCase()}`;
                
                return (
                  <Link key={pvCase.id} href={`/pv/cases/${pvCase.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                                pvCase.severity
                              )}`}
                            >
                              {pvCase.severity}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800">
                              <CheckCircle2 className="h-3 w-3 inline mr-1" />
                              EXPORTED
                            </span>
                          </div>

                          <div className="mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {caseId}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Medicine: <span className="font-medium">{pvCase.medicineName}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Escalated by: {pvCase.escalatedBy}</span>
                            </div>
                            <div>
                              Exported: {formatDate(pvCase.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
