/**
 * Escalate PV Case to Safety Lead
 */

import { NextRequest, NextResponse } from "next/server";
import { escalatePVCase } from "@/lib/db/pv";
import { EscalatePVCaseInput } from "@/types/pv";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: EscalatePVCaseInput & { userId: string } = await request.json();

    if (!body.userId || !body.escalationReason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const escalated = await escalatePVCase(
      params.id,
      {
        escalationReason: body.escalationReason,
        requiredActions: body.requiredActions,
        priority: body.priority,
      },
      body.userId
    );

    return NextResponse.json({
      ok: true,
      data: escalated,
    });
  } catch (error) {
    console.error("Error escalating case:", error);
    return NextResponse.json(
      { error: "Failed to escalate case" },
      { status: 500 }
    );
  }
}
