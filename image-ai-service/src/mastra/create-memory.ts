import { Memory } from "@mastra/memory";

export const memory = new Memory({
  options: {
    // 直近１０のメッセージが自動的に取り込まれる
    lastMessages: 10,
    generateTitle: {
      model: "openai/gpt-5-nano",
      instructions:
        "ユーザーの最初のメッセージに基づいて、会話の簡潔なタイトルを日本語で生成してください。"
    },
    workingMemory: {
      enabled: true,
      scope: "resource",
      template: `## ユーザープロフィール
- 名前: [未入力]
- 使用言語: [自動検出]

## 画像の好み
- スタイル: [未設定]（例：リアル、アニメ、水彩、油絵など）
- よく使う題材: [なし]

## 直近のコンテキスト
- 最後の生成リクエスト: [なし]
- 進行中のプロジェクト: [なし]`
    }
  }
});
