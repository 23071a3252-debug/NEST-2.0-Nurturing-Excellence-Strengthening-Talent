import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { PVCase } from "@/types/pv";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const collection = db.collection<PVCase>("pv_cases");

    const pvCase = await collection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!pvCase) {
      return NextResponse.json({ error: "PV case not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      pvCase: {
        ...pvCase,
        id: pvCase._id!.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching PV case:", error);
    return NextResponse.json(
      { error: "Failed to fetch PV case" },
      { status: 500 }
    );
  }
}
