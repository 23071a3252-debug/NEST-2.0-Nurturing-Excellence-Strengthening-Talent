import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { PVCase, Followup, AuditLog } from "@/types/pv";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { requestedBy, requestedFields, requestNotes } = body;

    if (!requestedBy || !requestedFields || requestedFields.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get PV case
    const pvCasesCollection = db.collection<PVCase>("pv_cases");
    const pvCase = await pvCasesCollection.findOne({
      _id: new ObjectId(params.id) as any,
    });

    if (!pvCase) {
      return NextResponse.json({ error: "PV case not found" }, { status: 404 });
    }

    // Create follow-up
    const followupsCollection = db.collection<Followup>("followups");
    const followup: Followup = {
      createdAt: new Date(),
      updatedAt: new Date(),
      pvCaseId: params.id,
      reportId: pvCase.sourceReportId,
      requestedBy,
      assignedTo: pvCase.sourceReportSnapshot.doctorReply?.doctorId || "",
      requestedFields,
      requestNotes,
      status: "PENDING",
    };

    const result = await followupsCollection.insertOne(followup);

    // Update PV case status
    await pvCasesCollection.updateOne(
      { _id: new ObjectId(params.id) as any },
      {
        $set: {
          status: "FOLLOWUP_REQUESTED",
          updatedAt: new Date(),
        },
      }
    );

    // Audit log
    const auditCollection = db.collection<AuditLog>("audit_logs");
    await auditCollection.insertOne({
      timestamp: new Date(),
      entityType: "FOLLOWUP",
      entityId: result.insertedId.toString(),
      action: "FOLLOWUP_REQUESTED",
      performedBy: requestedBy,
      performedByRole: "PV_OFFICER",
      details: { pvCaseId: params.id, requestedFields },
    });

    return NextResponse.json({
      ok: true,
      followupId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error creating follow-up:", error);
    return NextResponse.json(
      { error: "Failed to create follow-up" },
      { status: 500 }
    );
  }
}
