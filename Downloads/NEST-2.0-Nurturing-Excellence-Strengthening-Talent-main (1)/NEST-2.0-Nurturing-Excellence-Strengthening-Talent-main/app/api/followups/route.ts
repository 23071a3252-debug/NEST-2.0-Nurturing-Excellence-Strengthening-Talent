import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { Followup } from "@/types/pv";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const doctorId = searchParams.get("doctorId");
  const status = searchParams.get("status");

  try {
    const db = await getDb();
    const collection = db.collection<Followup>("followups");

    // Build query
    const query: any = {};
    if (doctorId) query.assignedTo = doctorId;
    if (status) query.status = status;

    const followups = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const followupList = followups.map((followup) => ({
      ...followup,
      id: followup._id!.toString(),
      _id: undefined,
    }));

    return NextResponse.json(followupList);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-ups" },
      { status: 500 }
    );
  }
}
