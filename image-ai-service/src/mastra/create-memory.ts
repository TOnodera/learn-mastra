import { Memory } from "@mastra/memory";

export const memory = new Memory({
  options: {
    // 直近１０のメッセージが自動的に取り込まれる
    lastMessages: 10
  }
});
