import { auth } from "@/lib/auth";
import { mastra } from "@/mastra";
import { error } from "console";
import { NextResponse } from "next/server";

/**
 *
 * 特定のユーザーのすべてのスレッドを取得する
 * @param req
 * @returns
 */
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

  const result = await memory.listThreads({
    filter: { resourceId },
    orderBy: { field: "createdAt", direction: "DESC" }
  });
  return NextResponse.json(result.threads);
}

/**
 * 新規スレッドを追加する
 * @param req
 * @returns
 */
export async function POST(req: Request) {
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
    return NextResponse.json(
      {
        error: "memory not configured"
      },
      { status: 500 }
    );
  }

  const thread = await memory.createThread({ resourceId });
  return NextResponse.json(thread);
}
