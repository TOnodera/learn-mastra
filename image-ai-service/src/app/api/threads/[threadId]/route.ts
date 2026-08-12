import { auth } from "@/lib/auth";
import { mastra } from "@/mastra";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const memory = await mastra.getAgentById("image-support-agent").getMemory();
  if (!memory) {
    return NextResponse.json(
      {
        error: "Memory not configured"
      },
      { status: 500 }
    );
  }

  const thread = await memory.getThreadById({ threadId });
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json(thread);
}

/**
 * 特定のスレッドを削除する
 * @param req
 * @param param
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({
    headers: req.headers
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;

  const memory = await mastra.getAgentById("image-support-agent").getMemory();
  if (!memory) {
    return NextResponse.json(
      {
        error: "memory not configured"
      },
      { status: 500 }
    );
  }

  await memory.deleteThread(threadId);
  return NextResponse.json({
    success: true
  });
}
