import { Agent } from "@mastra/core/agent";

export const imageSupportAgent = new Agent({
  id: "image-support-agent",
  name: "image-support-agent",
  instructions: `あなたは画像生成AIサービスのサポートエージェントです。ユーザーの質問に丁寧に答えてください。`,
  model: "openai/gpt-4.1-nano"
});
