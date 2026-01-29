/**
 * PV Follow-Up Tasks API
 * Create, list, and manage follow-up tasks
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createFollowUpTask,
  getFollowUpTasksForDoctor,
  getFollowUpTasksByCase,
  sendFollowUpTask,
  updateFollowUpTaskStatus,
  sendFollowUpReminder,
} from "@/lib/db/pv";
import { CreatePVFollowUpTaskInput, UpdatePVFollowUpTaskInput } from "@/types/pv";
import { ObjectId } from "mongodb";

/**
 * GET /api/pv-followups
 * Get follow-up tasks (filtered by case or doctor)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const caseId = searchParams.get("caseId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");

    if (caseId) {
      const tasks = await getFollowUpTasksByCase(caseId);
      return NextResponse.json({
        ok: true,
        data: tasks,
      });
    }

    if (doctorId) {
      const tasks = await getFollowUpTasksForDoctor(doctorId, status || undefined);
      return NextResponse.json({
        ok: true,
        data: tasks,
      });
    }

    return NextResponse.json(
      { error: "caseId or doctorId required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching follow-up tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-up tasks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pv-followups
 * Create a new follow-up task
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePVFollowUpTaskInput & { userId: string } = await request.json();

    if (!body.userId || !body.pvCaseId || !body.doctorId || !body.requiredFields) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const input: CreatePVFollowUpTaskInput = {
      pvCaseId: body.pvCaseId,
      doctorId: body.doctorId,
      title: body.title,
      description: body.description,
      requiredFields: body.requiredFields,
      priority: body.priority,
      dueDate: new Date(body.dueDate),
    };

    const task = await createFollowUpTask(input, body.userId);

    return NextResponse.json(
      { ok: true, data: task },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating follow-up task:", error);
    return NextResponse.json(
      { error: "Failed to create follow-up task" },
      { status: 500 }
    );
  }
}
