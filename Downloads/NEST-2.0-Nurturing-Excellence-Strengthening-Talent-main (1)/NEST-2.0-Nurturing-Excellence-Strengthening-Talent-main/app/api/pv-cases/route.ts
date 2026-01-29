import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { PVCase, PVCaseListItem } from "@/types/pv";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const assignedTo = searchParams.get("assignedTo");

  try {
    const db = await getDb();
    const collection = db.collection<PVCase>("pv_cases");

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const pvCases = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const pvCaseList: PVCaseListItem[] = pvCases.map((pvCase) => ({
      id: pvCase._id!.toString(),
      createdAt: pvCase.createdAt.toISOString(),
      status: pvCase.status,
      medicineName: pvCase.sourceReportSnapshot.questionnaire.medicineName,
      severity: pvCase.sourceReportSnapshot.questionnaire.severity,
      missingFieldsCount: pvCase.missingFields?.length || 0,
      hasFollowup: pvCase.status === "FOLLOWUP_REQUESTED",
      escalatedBy: pvCase.escalatedBy,
    }));

    return NextResponse.json(pvCaseList);
  } catch (error) {
    console.error("Error fetching PV cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch PV cases" },
      { status: 500 }
    );
  }
}
