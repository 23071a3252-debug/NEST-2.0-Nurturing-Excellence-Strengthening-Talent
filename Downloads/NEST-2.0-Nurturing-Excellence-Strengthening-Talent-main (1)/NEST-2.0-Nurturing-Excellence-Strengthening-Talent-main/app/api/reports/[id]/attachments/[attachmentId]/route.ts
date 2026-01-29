/**
 * GET /api/reports/[id]/attachments/[attachmentId] - Stream image from GridFS
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { MongoReport } from '@/types/report';
import { ObjectId, GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const { id, attachmentId } = params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(attachmentId)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reportsCollection = db.collection('reports');

    // Verify report exists and has this attachment
    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });

    if (!report) {
      return NextResponse.json(
        { ok: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    const attachment = report.attachments.find((att: any) => att.attachmentId === attachmentId);

    if (!attachment) {
      return NextResponse.json(
        { ok: false, error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // Stream from GridFS
    const bucket = new GridFSBucket(db, { bucketName: 'report_images' });

    try {
      const downloadStream = bucket.openDownloadStream(new ObjectId(attachmentId));

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      
      for await (const chunk of downloadStream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      // Return image with proper headers
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': attachment.mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });

    } catch (streamError) {
      console.error('GridFS stream error:', streamError);
      return NextResponse.json(
        { ok: false, error: 'File not found in storage' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error streaming attachment:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to retrieve attachment' },
      { status: 500 }
    );
  }
}
