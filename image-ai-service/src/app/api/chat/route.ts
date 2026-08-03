import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getMonthlyTokenLimit, PLANS } from "@/lib/plans";
import { getMonthlyTokenUsage, incrementTokenUsage } from "@/lib/token-usage";
import { RequestContext } from "@mastra/core/request-context";
import type { Plan } from "@/lib/plans";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resourceId = session.user.id;

  // プランとトークン残量のチェック
  const userPlan = (session.user as { plan?: string }).plan ?? "free";
  const plan = (userPlan in PLANS ? userPlan : "free") as keyof typeof PLANS;
  const limit = getMonthlyTokenLimit(plan);

  const used = await getMonthlyTokenUsage(resourceId);

  if (used >= limit) {
    return NextResponse.json(
      {
        error:
          "月次トークン上限に達しました。プランをアップデートしてください。",
        plan,
        limit,
        used
      },
      { status: 429 }
    );
  }

  const params = await req.json();

  const requestContext = new RequestContext<{ plan: Plan }>();
  requestContext.set("plan", plan);

  const stream = await handleChatStream({
    mastra,
    agentId: "image-support-agent",
    version: "v6",
    params: {
      ...params,
      requestContext,
      onFinish: async (event) => {
        const tokens = event.totalUsage?.totalTokens ?? 0;
        if (tokens > 0) {
          await incrementTokenUsage(resourceId, tokens).catch(console.error);
        }
      }
    }
  });

  return createUIMessageStreamResponse({ stream });
}
