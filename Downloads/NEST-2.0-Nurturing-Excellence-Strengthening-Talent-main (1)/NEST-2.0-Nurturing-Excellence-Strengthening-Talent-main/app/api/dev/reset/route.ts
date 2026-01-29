import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { GridFSBucket } from 'mongodb';

/**
 * DEV ONLY - Reset endpoint to clear MongoDB reports and GridFS files
 * This should be disabled in production
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { ok: false, error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const db = await getDb();
    
    // Clear reports collection
    const reportsCollection = db.collection('reports');
    await reportsCollection.deleteMany({});

    // Clear GridFS files
    const bucket = new GridFSBucket(db, { bucketName: 'report_images' });
    const filesCollection = db.collection('report_images.files');
    const chunksCollection = db.collection('report_images.chunks');
    
    await filesCollection.deleteMany({});
    await chunksCollection.deleteMany({});

    // Optionally seed some sample data
    const sampleReports = [
      {
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
        createdByRole: 'PATIENT',
        createdByUserId: 'patient-1',
        linkedDoctorId: 'doc-1',
        status: 'SENT_TO_DOCTOR',
        patientInfo: {
          name: 'John Doe',
          age: 45,
          contact: '+1234567890',
        },
        questionnaire: {
          symptoms: 'Experiencing severe headaches and nausea after taking medication',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'MODERATE',
          medicineName: 'Aspirin 500mg',
          doseDuration: '2 tablets daily for 5 days',
          currentCondition: 'Headache persists, nausea has reduced',
          additionalNotes: 'Started after second day of medication',
        },
        attachments: [],
      },
      {
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(),
        createdByRole: 'PATIENT',
        createdByUserId: 'patient-1',
        linkedDoctorId: 'doc-2',
        status: 'DOCTOR_REPLIED',
        patientInfo: {
          name: 'Jane Smith',
          age: 32,
          contact: '+1987654321',
        },
        questionnaire: {
          symptoms: 'Skin rash and itching',
          startTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'MILD',
          medicineName: 'Amoxicillin 250mg',
          doseDuration: '3 times daily for 7 days',
          currentCondition: 'Rash spreading slowly',
        },
        attachments: [],
        doctorReply: {
          doctorId: 'doc-2',
          doctorAssessment: 'Likely allergic reaction to amoxicillin',
          actionTaken: 'Advised to stop medication immediately',
          adviceGiven: 'Visit clinic for alternative antibiotic prescription',
          needsEscalation: false,
          repliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      },
      {
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(),
        createdByRole: 'PATIENT',
        createdByUserId: 'patient-1',
        linkedDoctorId: 'doc-3',
        status: 'SENT_TO_DOCTOR',
        patientInfo: {
          name: 'Robert Johnson',
          age: 58,
          contact: '+1122334455',
        },
        questionnaire: {
          symptoms: 'Chest pain and difficulty breathing',
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'SEVERE',
          medicineName: 'Lisinopril 10mg',
          doseDuration: '1 tablet daily for 30 days',
          currentCondition: 'Pain is constant, breathing difficulty increasing',
          additionalNotes: 'Also experiencing dizziness',
        },
        attachments: [],
      },
    ];

    await reportsCollection.insertMany(sampleReports);

    return NextResponse.json({
      ok: true,
      message: 'Database reset successfully',
      reportsCreated: sampleReports.length,
    });

  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}
