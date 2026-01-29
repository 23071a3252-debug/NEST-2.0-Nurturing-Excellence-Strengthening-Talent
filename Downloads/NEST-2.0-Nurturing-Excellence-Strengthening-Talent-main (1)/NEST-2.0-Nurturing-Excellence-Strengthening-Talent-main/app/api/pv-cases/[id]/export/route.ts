import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { PVCase, AuditLog } from "@/types/pv";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { exportedBy } = body;

    if (!exportedBy) {
      return NextResponse.json(
        { error: "exportedBy is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const pvCasesCollection = db.collection<PVCase>("pv_cases");

    const pvCase = await pvCasesCollection.findOne({
      _id: new ObjectId(params.id) as any,
    });

    if (!pvCase) {
      return NextResponse.json({ error: "PV case not found" }, { status: 404 });
    }

    // Build export data
    const exportData = {
      caseId: params.id,
      exportedAt: new Date().toISOString(),
      exportedBy,
      
      // Patient information
      patientInfo: pvCase.sourceReportSnapshot.patientInfo,
      
      // Report details
      reportDetails: {
        symptoms: pvCase.sourceReportSnapshot.questionnaire.symptoms,
        startTime: pvCase.sourceReportSnapshot.questionnaire.startTime,
        severity: pvCase.sourceReportSnapshot.questionnaire.severity,
        medicineName: pvCase.sourceReportSnapshot.questionnaire.medicineName,
        doseDuration: pvCase.sourceReportSnapshot.questionnaire.doseDuration,
        currentCondition: pvCase.sourceReportSnapshot.questionnaire.currentCondition,
        additionalNotes: pvCase.sourceReportSnapshot.questionnaire.additionalNotes,
      },
      
      // Doctor assessment
      doctorAssessment: pvCase.sourceReportSnapshot.doctorReply,
      
      // Escalation details
      escalationDetails: {
        escalatedBy: pvCase.escalatedBy,
        escalatedAt: pvCase.escalatedAt,
        suspectedADR: pvCase.escalationAnswers.suspectedADR,
        seriousness: pvCase.escalationAnswers.seriousness,
        actionTaken: pvCase.escalationAnswers.actionTaken,
        outcome: pvCase.escalationAnswers.outcome,
        reporterType: pvCase.escalationAnswers.reporterType,
        additionalNotes: pvCase.escalationAnswers.additionalNotes,
      },
      
      // PV notes
      pvOfficerNotes: pvCase.pvOfficerNotes || [],
      
      // Metadata
      createdAt: pvCase.createdAt,
      status: pvCase.status,
    };

    // Update PV case - assign to safety officer
    await pvCasesCollection.updateOne(
      { _id: new ObjectId(params.id) as any },
      {
        $set: {
          status: "EXPORTED",
          exportedAt: new Date(),
          exportedBy,
          exportData,
          assignedToSafety: true,
          assignedToSafetyAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Audit logs
    const auditCollection = db.collection<AuditLog>("audit_logs");
    await auditCollection.insertMany([
      {
        timestamp: new Date(),
        entityType: "PV_CASE",
        entityId: params.id,
        action: "EXPORTED",
        performedBy: exportedBy,
        performedByRole: "PV_OFFICER",
        details: { message: "Case exported and forwarded to Safety Officer" },
      },
      {
        timestamp: new Date(),
        entityType: "PV_CASE",
        entityId: params.id,
        action: "ASSIGNED_TO_SAFETY",
        performedBy: exportedBy,
        performedByRole: "PV_OFFICER",
        details: { message: "Case assigned to Safety Lead for review" },
      }
    ]);

    return NextResponse.json({
      ok: true,
      exportData,
    });
  } catch (error) {
    console.error("Error exporting PV case:", error);
    return NextResponse.json(
      { error: "Failed to export PV case" },
      { status: 500 }
    );
  }
}
