import { Memory } from "@mastra/memory";

export const memory = new Memory({
  options: {
    // 直近１０のメッセージが自動的に取り込まれる
    lastMessages: 10,
    generateTitle: {
      model: "openai/gpt-5-nano",
      instructions:
        "ユーザーの最初のメッセージに基づいて、会話の簡潔なタイトルを日本語で生成してください。"
    }
  }
});
