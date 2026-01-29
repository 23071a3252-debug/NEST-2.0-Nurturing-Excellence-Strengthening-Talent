/**
 * GET /api/reports/[id] - Get single report by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { MongoReport, ReportWithUrls } from '@/types/report';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reportsCollection = db.collection('reports');

    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });

    if (!report) {
      return NextResponse.json(
        { ok: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Build response with attachment URLs
    const responseReport: ReportWithUrls = {
      id: report._id!.toString(),
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      createdByRole: report.createdByRole,
      createdByUserId: report.createdByUserId,
      linkedDoctorId: report.linkedDoctorId,
      status: report.status,
      patientInfo: report.patientInfo,
      questionnaire: report.questionnaire,
      attachments: report.attachments.map((att: any) => ({
        ...att,
        url: `/api/reports/${id}/attachments/${att.attachmentId}`,
      })),
    };

    return NextResponse.json({
      ok: true,
      report: responseReport,
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
