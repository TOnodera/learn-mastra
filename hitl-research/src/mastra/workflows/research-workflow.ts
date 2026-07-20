import { createStep, createWorkflow } from "@mastra/core/workflows";
import { queryObjects } from "node:v8";
import { z } from "zod";

/**
 * ユーザーのクエリを取得
 */
const getUserQueryStep = createStep({
  id: "get-user-query",
  inputSchema: z.object({
    query: z.string()
  }),
  outputSchema: z.object({
    query: z.string()
  }),
  resumeSchema: z.object({
    query: z.string()
  }),
  suspendSchema: z.object({
    message: z.string()
  }),
  execute: async ({ inputData, resumeData, suspend, mastra }) => {
    // resumeDataがあれば修正されたクエリを使用
    const query = resumeData?.query ?? inputData?.query;

    const agent = mastra.getAgent("queryEvaluationAgent");

    const result = await agent.generate(
      `クエリ: ${query} このクエリは検索可能ですか？`,
      {
        structuredOutput: {
          schema: z.object({
            isSearchable: z.boolean()
          }),
          jsonPromptInjection: true
        }
      }
    );

    const isSearchable = result.object?.isSearchable ?? false;

    if (resumeData) {
      return { query: resumeData.query };
    }

    // 検索不可の場合はsuspend
    if (!isSearchable) {
      return await suspend({
        message: `${query} もう少し具体的にしてもらえますか？？`
      });
    }

    // 検索可能ならそのまま返す
    return { query };
  }
});

export const researchWorkflow = createWorkflow({
  id: "research-workflow",
  inputSchema: z.object({
    query: z.string().describe("検索したい内容を教えてください！")
  }),
  outputSchema: z.object({
    query: z.string().describe("検索可能なクエリ")
  }),
  steps: [getUserQueryStep]
});

researchWorkflow.then(getUserQueryStep).commit();
