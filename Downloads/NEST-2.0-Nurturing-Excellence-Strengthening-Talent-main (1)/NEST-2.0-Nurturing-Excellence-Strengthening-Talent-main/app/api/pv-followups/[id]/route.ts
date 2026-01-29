/**
 * PV Follow-Up Task Detail API
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import {
  sendFollowUpTask,
  updateFollowUpTaskStatus,
  sendFollowUpReminder,
} from "@/lib/db/pv";
import { UpdatePVFollowUpTaskInput } from "@/types/pv";

/**
 * GET /api/pv-followups/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const collection = db.collection("pv_followup_tasks");

    const task = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: task,
    });
  } catch (error) {
    console.error("Error fetching follow-up task:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-up task" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pv-followups/[id]
 * Update follow-up task status and response
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdatePVFollowUpTaskInput & { userId: string } = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const input: UpdatePVFollowUpTaskInput = {
      status: body.status,
      doctorResponse: body.doctorResponse,
    };

    const updated = await updateFollowUpTaskStatus(
      params.id,
      input,
      body.userId
    );

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating follow-up task:", error);
    return NextResponse.json(
      { error: "Failed to update follow-up task" },
      { status: 500 }
    );
  }
}
