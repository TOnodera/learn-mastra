import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { LibSQLVector } from "@mastra/libsql";
import { Memory } from "@mastra/memory";

export const memory = new Memory({
  // 埋め込みモデル
  embedder: new ModelRouterEmbeddingModel("openai/text-embedding-3-small"),
  // ベクトルDB
  vector: new LibSQLVector({
    id: "image-support-agent-vector",
    url: "file:./local.db"
  }),
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
    },
    semanticRecall: {
      topK: 3, // 取得する類似メッセージの件数
      messageRange: 2, // 取得したメッセージの前後に含める文脈の件数
      scope: "resource" // thread or resource resourceはユーザーの長期記憶を活かせる。threadは対象のスレッドのみ
    }
  }
});
