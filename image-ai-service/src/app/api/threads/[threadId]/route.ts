import { auth } from "@/lib/auth";
import { mastra } from "@/mastra";
import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resourceId = session.user.id;
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  if (!threadId) {
    return NextResponse.json([]);
  }

  const memory = await mastra.getAgentById("image-support-agent").getMemory();
  if (!memory) {
    return NextResponse.json([]);
  }

  const response = await memory.recall({ threadId, resourceId });
  const uiMessages = toAISdkV5Messages(response?.messages ?? []);

  return NextResponse.json(uiMessages);
}

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

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
