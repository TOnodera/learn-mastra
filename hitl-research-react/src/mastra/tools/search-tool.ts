import { tavily } from "tavily";
import "dotenv/config";
import { createTool } from "@mastra/core/tools";
import z from "zod";
import { queryEvaluationAgent } from "../agents/query-evaluation-agent";
import { contextFields } from "@mastra/core/storage";
import { resourceUsage } from "node:process";
import { error } from "node:console";

const apiKey = process.env.TAVILY_API_KEY || "";
const client = tavily({ apiKey });

export const searchTool = createTool({
  id: "search-tool",
  description: `Tavilyを使用して特定のクエリに関するWeb情報を検索し、要約されたコンテンツを返します`,
  inputSchema: z.object({
    query: z.string().describe("実行する検索クエリ")
  }),
  outputSchema: z.object({
    results: z.array(
      z
        .object({
          title: z.string().describe("検索結果のタイトル"),
          url: z.string().describe("検索結果のURL"),
          content: z.string().describe("検索結果の要約コンテンツ")
        })
        .describe("検索結果のリスト")
    ),
    error: z.string().optional().describe("エラーメッセージ（存在する場合）")
  }),
  execute: async (inputData, context) => {
    const logger = context?.mastra?.getLogger();
    logger?.info("Web検索ツールを実行中");
    const { query } = inputData;

    try {
      if (!apiKey) {
        logger?.error("TAVILY_API_KEYが見つかりません");
        return {
          results: [],
          error: "APIキーが見つかりませんでした"
        };
      }

      logger?.debug(`Webを検索中: ${query}`);
      const response = await client.search(query);
      if (!response.results || response.results.length === 0) {
        return {
          results: [],
          error: "検索結果が見つかりませんでした"
        };
      }

      const processResults = response.results.slice(0, 3).map((result) => ({
        title: result.title || "",
        url: result.url,
        content: result.content
          ? result.content.substring(0, 1000)
          : "コンテンツが有りません"
      }));

      return { results: processResults };
    } catch (e: any) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラー";
      return {
        results: [],
        error: errorMessage
      };
    }
  }
});
