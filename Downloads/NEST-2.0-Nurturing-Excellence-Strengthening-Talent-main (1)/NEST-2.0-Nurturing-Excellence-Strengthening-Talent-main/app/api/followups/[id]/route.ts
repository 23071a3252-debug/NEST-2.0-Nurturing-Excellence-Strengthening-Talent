import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Followup } from "@/types/pv";

const uri = process.env.MONGODB_URI!;
const dbName = "pharma-vigilance-db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection<Followup>("followups");

    const followup = await collection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!followup) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      followup: {
        ...followup,
        id: followup._id!.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching follow-up:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-up" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
