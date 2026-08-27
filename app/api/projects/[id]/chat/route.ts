import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendChatMessageAction } from "@/lib/actions/ai";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const message = body?.message;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Message string is required" } },
        { status: 400 }
      );
    }

    const result = await sendChatMessageAction(id, message);

    if (!result.success) {
      const status = result.error.code === "NOT_FOUND" ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("POST /api/projects/[id]/chat error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to process chat message" } },
      { status: 500 }
    );
  }
}
