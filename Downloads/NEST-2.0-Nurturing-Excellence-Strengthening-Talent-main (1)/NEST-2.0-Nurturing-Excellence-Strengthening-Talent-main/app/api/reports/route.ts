/**
 * POST /api/reports - Create new patient report
 * GET /api/reports - List reports with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { MongoReport, ReportListItem } from '@/types/report';
import { ObjectId, GridFSBucket } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const linkedDoctorId = formData.get('linkedDoctorId') as string;
    const createdByUserId = formData.get('createdByUserId') as string;
    const symptoms = formData.get('symptoms') as string;
    const startTime = formData.get('startTime') as string;
    const severity = formData.get('severity') as string;
    const medicineName = formData.get('medicineName') as string;
    const doseDuration = formData.get('doseDuration') as string;
    const currentCondition = formData.get('currentCondition') as string;
    const additionalNotes = formData.get('additionalNotes') as string;
    
    // Optional patient info
    const patientName = formData.get('patientName') as string;
    const patientAge = formData.get('patientAge') as string;
    const patientContact = formData.get('patientContact') as string;

    // Image upload
    const imageFile = formData.get('image') as File | null;

    // Validation
    if (!linkedDoctorId || !createdByUserId || !symptoms || !startTime || !severity || !medicineName) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reportsCollection = db.collection<MongoReport>('reports');

    // Handle image upload via GridFS
    const attachments: MongoReport['attachments'] = [];
    
    if (imageFile && imageFile.size > 0) {
      const bucket = new GridFSBucket(db, { bucketName: 'report_images' });
      
      // Convert File to Buffer
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create upload stream
      const uploadStream = bucket.openUploadStream(imageFile.name, {
        contentType: imageFile.type,
      });

      // Write buffer to GridFS
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
        uploadStream.write(buffer);
        uploadStream.end();
      });

      attachments.push({
        attachmentId: uploadStream.id.toString(),
        filename: imageFile.name,
        mimeType: imageFile.type,
        uploadedAt: new Date(),
      });
    }

    // Build report document
    const report: MongoReport = {
      createdAt: new Date(),
      createdByRole: 'PATIENT',
      createdByUserId,
      linkedDoctorId,
      status: 'SENT_TO_DOCTOR',
      patientInfo: {
        name: patientName || undefined,
        age: patientAge ? parseInt(patientAge) : undefined,
        contact: patientContact || undefined,
      },
      questionnaire: {
        symptoms,
        startTime,
        severity: severity as "MILD" | "MODERATE" | "SEVERE",
        medicineName,
        doseDuration,
        currentCondition,
        additionalNotes: additionalNotes || undefined,
      },
      attachments,
    };

    // Insert into MongoDB
    const result = await reportsCollection.insertOne(report);

    // Build response with attachment URLs
    const responseReport = {
      id: result.insertedId.toString(),
      ...report,
      attachments: attachments.map(att => ({
        ...att,
        url: `/api/reports/${result.insertedId.toString()}/attachments/${att.attachmentId}`,
      })),
    };

    return NextResponse.json({
      ok: true,
      report: responseReport,
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkedDoctorId = searchParams.get('linkedDoctorId');
    const createdByUserId = searchParams.get('createdByUserId');
    const status = searchParams.get('status');

    if (!linkedDoctorId && !createdByUserId && !status) {
      return NextResponse.json(
        { ok: false, error: 'Must provide linkedDoctorId, createdByUserId, or status filter' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reportsCollection = db.collection<MongoReport>('reports');

    // Build filter
    const filter: any = {};
    if (linkedDoctorId) filter.linkedDoctorId = linkedDoctorId;
    if (createdByUserId) filter.createdByUserId = createdByUserId;
    if (status) {
      // Handle comma-separated status values
      const statusValues = status.split(',').map(s => s.trim());
      if (statusValues.length > 1) {
        filter.status = { $in: statusValues };
      } else {
        filter.status = status;
      }
    }

    // Fetch reports
    const reports = await reportsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Map to list items
    const listItems: ReportListItem[] = reports.map(report => ({
      id: report._id!.toString(),
      createdAt: report.createdAt.toISOString(),
      severity: report.questionnaire.severity,
      status: report.status,
      medicineName: report.questionnaire.medicineName,
      hasImage: report.attachments.length > 0,
      createdByRole: report.createdByRole,
      linkedDoctorId: report.linkedDoctorId,
      symptomDescription: report.questionnaire.symptoms,
      patientName: report.patientInfo?.name,
    }));

    return NextResponse.json(listItems);

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
