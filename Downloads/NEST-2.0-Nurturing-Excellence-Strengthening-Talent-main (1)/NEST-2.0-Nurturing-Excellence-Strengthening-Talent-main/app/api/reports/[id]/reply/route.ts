import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const body = await request.json();

    const { doctorId, doctorAssessment, actionTaken, adviceGiven, needsEscalation } = body;

    if (!doctorId || !doctorAssessment || !actionTaken || !adviceGiven) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
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
    const reportsCollection = db.collection('reports');

    // Determine status based on escalation flag
    const newStatus = needsEscalation ? 'ESCALATED_TO_PV' : 'DOCTOR_REPLIED';

    // Update report with doctor reply
    const result = await reportsCollection.updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          status: newStatus,
          doctorReply: {
            doctorId,
            doctorAssessment,
            actionTaken,
            adviceGiven,
            needsEscalation,
            repliedAt: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Get updated report
    const updatedReport = await reportsCollection.findOne({
      _id: new ObjectId(reportId),
    });

    return NextResponse.json({
      ok: true,
      report: updatedReport,
    });

  } catch (error) {
    console.error('Error updating report with doctor reply:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
