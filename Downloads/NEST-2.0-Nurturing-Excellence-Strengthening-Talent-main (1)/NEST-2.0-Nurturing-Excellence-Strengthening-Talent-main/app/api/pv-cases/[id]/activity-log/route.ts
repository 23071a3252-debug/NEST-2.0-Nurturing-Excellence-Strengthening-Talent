/**
 * PV Case Activity Log API
 * Retrieve complete audit trail for a case
 */

import { NextRequest, NextResponse } from "next/server";
import { getPVActivityLog } from "@/lib/db/pv";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const activityLog = await getPVActivityLog(params.id, limit);

    return NextResponse.json({
      ok: true,
      data: activityLog,
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}
