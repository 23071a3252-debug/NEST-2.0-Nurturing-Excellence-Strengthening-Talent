import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { Followup, PVCase, AuditLog } from "@/types/pv";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { responses, additionalNotes, doctorId } = body;

    if (!responses || !doctorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const followupsCollection = db.collection<Followup>("followups");

    // Update follow-up
    const result = await followupsCollection.updateOne(
      { _id: new ObjectId(params.id) as any },
      {
        $set: {
          status: "SUBMITTED",
          doctorResponse: {
            submittedAt: new Date(),
            responses,
            additionalNotes,
          },
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
    }

    // Get followup to update PV case
    const followup = await followupsCollection.findOne({
      _id: new ObjectId(params.id) as any,
    });

    if (followup) {
      // Update PV case status
      const pvCasesCollection = db.collection<PVCase>("pv_cases");
      await pvCasesCollection.updateOne(
        { _id: new ObjectId(followup.pvCaseId) as any },
        {
          $set: {
            status: "UNDER_REVIEW",
            updatedAt: new Date(),
          },
        }
      );
    }

    // Audit log
    const auditCollection = db.collection<AuditLog>("audit_logs");
    await auditCollection.insertOne({
      timestamp: new Date(),
      entityType: "FOLLOWUP",
      entityId: params.id,
      action: "FOLLOWUP_SUBMITTED",
      performedBy: doctorId,
      performedByRole: "DOCTOR",
      details: { responses },
    });

    return NextResponse.json({
      ok: true,
      message: "Follow-up submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting follow-up:", error);
    return NextResponse.json(
      { error: "Failed to submit follow-up" },
      { status: 500 }
    );
  }
}
