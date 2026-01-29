/**
 * PV Officer Dashboard Statistics API
 */

import { NextRequest, NextResponse } from "next/server";
import { getPVDashboardStats, getOverdueItems } from "@/lib/db/pv";

/**
 * GET /api/pv-dashboard/stats
 * Get dashboard statistics for PV officer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const assignedTo = searchParams.get("assignedTo");

    const stats = await getPVDashboardStats(assignedTo || undefined);
    const { overdueCases, overdueTasks } = await getOverdueItems(
      assignedTo || undefined
    );

    return NextResponse.json({
      ok: true,
      data: {
        stats,
        overdueCases: overdueCases.length,
        overdueTasks: overdueTasks.length,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
