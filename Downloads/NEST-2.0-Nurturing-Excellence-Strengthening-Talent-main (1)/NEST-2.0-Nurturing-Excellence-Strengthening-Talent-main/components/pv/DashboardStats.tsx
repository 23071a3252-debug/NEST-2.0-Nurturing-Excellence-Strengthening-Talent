/**
 * PV Dashboard Statistics Component
 */

"use client";

import { PVDashboardStats } from "@/types/pv";
import Card from "@/components/ui/Card";

interface PVDashboardStatsProps {
  stats: PVDashboardStats;
}

export function PVDashboardStatsDisplay({ stats }: PVDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none">
            <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500">Total Cases</div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-gray-900">{stats.totalCases}</span>
            <span className="text-xs text-gray-500">{stats.severeCases} severe</span>
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500">Open Cases</div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-gray-900">{stats.openCases}</span>
            <span className="text-xs text-gray-500">Under review</span>
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500">Pending Follow-Up</div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-gray-900">{stats.awaitingFollowUp}</span>
            <span className="text-xs text-red-500">{stats.overdueCases} overdue</span>
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none">
            <path d="M10 2l6 10-6 10-6-10 6-10z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500">Escalated Cases</div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-gray-900">{stats.escalatedCases}</span>
            <span className="text-xs text-gray-500">Require immediate attention</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
