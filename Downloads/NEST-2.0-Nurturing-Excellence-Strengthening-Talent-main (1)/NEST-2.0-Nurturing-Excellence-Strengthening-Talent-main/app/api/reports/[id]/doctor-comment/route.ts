import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { MongoReport } from "@/types/report";
import { AuditLog } from "@/types/pv";

const uri = process.env.MONGODB_URI!;
const dbName = "pharma-vigilance-db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(uri);

  try {
    const body = await request.json();
    const { doctorId, comment } = body;

    if (!doctorId || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(dbName);
    const reportsCollection = db.collection<MongoReport>("reports");

    const result = await reportsCollection.updateOne(
      { _id: new ObjectId(params.id) as any },
      {
        $push: {
          doctorComments: {
            doctorId,
            comment,
            timestamp: new Date(),
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Audit log
    const auditCollection = db.collection<AuditLog>("audit_logs");
    await auditCollection.insertOne({
      timestamp: new Date(),
      entityType: "REPORT",
      entityId: params.id,
      action: "DOCTOR_COMMENT_ADDED",
      performedBy: doctorId,
      performedByRole: "DOCTOR",
      details: { comment },
    });

    return NextResponse.json({
      ok: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
