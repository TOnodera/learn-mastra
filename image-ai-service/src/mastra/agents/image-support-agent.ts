import { Plan, PLAN_MODELS } from "@/lib/plans";
import { Agent } from "@mastra/core/agent";
import {
  PromptInjectionDetector,
  TokenLimiterProcessor,
  UnicodeNormalizer
} from "@mastra/core/processors";
import { LocalFilesystem, Workspace } from "@mastra/core/workspace";

const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: "./workspace" }),
  skills: ["skills"],
  bm25: true
});

export const imageSupportAgent = new Agent({
  id: "image-support-agent",
  name: "image-support-agent",
  instructions: `
あなたは画像生成 AI サービスのサポートエージェントです。

## 機能
- ユーザーの質問や操作に関するサポート
- imageGenerationTool を使ってユーザーの要望に応じた画像を生成する

## ガイドライン
- 回答は簡潔かつ丁寧に行うこと
- ユーザーが画像の生成・作成・描画を要求した場合は、
  imageGenerationTool を使用すること
- スキルファイルに画像スタイル別の詳細なプロンプト指針があるので
  積極的に参照すること
- ユーザーのリクエストが曖昧な場合は確認の質問をすること
- ユーザーが使用している言語と同じ言語で応答すること
`,
  model: ({ requestContext }) => {
    const plan = (requestContext?.get("plan") as Plan | undefined) ?? "free";
    return PLAN_MODELS[plan];
  },
  inputProcessors: [
    // 入力文字列の前処理
    new UnicodeNormalizer({
      // タブや改行を除く制御文字（NULL文字など）を除去
      stripControlChars: true,
      // 絵文字を保持したままNFKC正規化（全角英数字の半角変換など）を適用
      preserveEmojis: true,
      // 連続する複数のタブ・スペース・改行を１つに圧縮
      collapseWhitespace: true,
      // メッセージの先頭・末尾の空白文字を除去
      trim: true
    }),
    // 利用できるトークンの上限を設定
    new TokenLimiterProcessor({ limit: 800 }), // 800は日本語1840文字相当
    // インジェクションを検出
    new PromptInjectionDetector({
      model: "openai/gpt-5-nano",
      /**
       * 検出時の挙動を設定
       * block: 拒否
       * warn: エラーログを残し、コンテンツはそのまま通過させる
       * filter: 疑わしいメッセージのみ除去して続行
       * rewrite: 意図を保ちながらインジェクションの無害化を試みる
       */
      strategy: "warn",
      // 閾値
      threshold: 0.8,
      // プロンプトインジェクション・制約回避・システムプロンプト上書き試行を検出
      detectionTypes: ["injection", "jailbreak", "system-override"],
      // LLMが構造化出力していない場合にJSON形式のプロンプトインジェクション検出を使用するかどうか
      structuredOutputOptions: {
        jsonPromptInjection: true
      }
    })
  ]
});
