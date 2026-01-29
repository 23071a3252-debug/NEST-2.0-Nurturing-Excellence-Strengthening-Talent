import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { MongoReport } from '@/types/report';
import { PVCase, AuditLog } from '@/types/pv';
import { EscalationAnswers } from '@/types/report';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const body = await request.json();

    const { escalatedBy, escalationAnswers } = body as {
      escalatedBy: string;
      escalationAnswers: EscalationAnswers;
    };

    if (!escalatedBy || !escalationAnswers) {
      return NextResponse.json(
        { ok: false, error: 'Escalated by and escalation answers required' },
        { status: 400 }
      );
    }

    // Validate required escalation fields
    if (!escalationAnswers.suspectedADR || !escalationAnswers.outcome || !escalationAnswers.reporterType) {
      return NextResponse.json(
        { ok: false, error: 'Missing required escalation fields' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(reportId)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reportsCollection = db.collection<MongoReport>('reports');
    const pvCasesCollection = db.collection<PVCase>('pv_cases');
    const auditCollection = db.collection<AuditLog>('audit_logs');

    // Get the report
    const report = await reportsCollection.findOne({
      _id: new ObjectId(reportId) as any,
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Create snapshot of report for PV case
    const escalationTimestamp = new Date();
    
    // Update report with escalation details
    await reportsCollection.updateOne(
      { _id: new ObjectId(reportId) as any },
      {
        $set: {
          status: 'ESCALATED_TO_PV',
          escalation: {
            escalatedBy,
            escalatedAt: escalationTimestamp,
            answers: escalationAnswers,
          },
          updatedAt: escalationTimestamp,
        },
      }
    );

    // Compute missing fields for PV review
    const missingFields: string[] = [];
    if (!report.patientInfo?.name) missingFields.push('Patient Name');
    if (!report.patientInfo?.age) missingFields.push('Patient Age');
    if (!report.patientInfo?.contact) missingFields.push('Patient Contact');
    if (!report.questionnaire.additionalNotes) missingFields.push('Additional Clinical Notes');
    if (!escalationAnswers.additionalNotes) missingFields.push('Escalation Notes');

    // Create PV case
    const pvCase: PVCase = {
      createdAt: escalationTimestamp,
      updatedAt: escalationTimestamp,
      sourceReportId: reportId,
      sourceReportSnapshot: {
        patientInfo: report.patientInfo,
        questionnaire: report.questionnaire,
        attachments: report.attachments,
        doctorReply: report.doctorReply,
      },
      escalationAnswers,
      escalatedBy,
      escalatedAt: escalationTimestamp,
      status: missingFields.length > 0 ? 'NEEDS_FOLLOWUP' : 'UNDER_REVIEW',
      missingFields: missingFields.length > 0 ? missingFields : undefined,
    };

    const pvCaseResult = await pvCasesCollection.insertOne(pvCase);

    // Audit logs
    await auditCollection.insertMany([
      {
        timestamp: escalationTimestamp,
        entityType: 'REPORT',
        entityId: reportId,
        action: 'ESCALATED_TO_PV',
        performedBy: escalatedBy,
        performedByRole: 'DOCTOR',
        details: { pvCaseId: pvCaseResult.insertedId.toString() },
      },
      {
        timestamp: escalationTimestamp,
        entityType: 'PV_CASE',
        entityId: pvCaseResult.insertedId.toString(),
        action: 'PV_CASE_CREATED',
        performedBy: escalatedBy,
        performedByRole: 'DOCTOR',
        details: { sourceReportId: reportId, missingFieldsCount: missingFields.length },
      },
    ]);

    return NextResponse.json({
      ok: true,
      message: 'Report escalated successfully',
      pvCaseId: pvCaseResult.insertedId.toString(),
      missingFields,
    });

  } catch (error) {
    console.error('Error escalating report:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to escalate report' },
      { status: 500 }
    );
  }
}
