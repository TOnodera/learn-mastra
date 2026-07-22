import { createStep, createWorkflow } from "@mastra/core/workflows";
import z from "zod";
import { researchDataSchema, researchWorkflow } from "./research-workflow";
import { queryEvaluationAgent } from "../agents/query-evaluation-agent";

// Deep Researchワークフローの出力を受け取り、条件分岐で処理する
const processResearchResultStep = createStep({
  id: "process-reserch-result",
  inputSchema: z.object({
    approved: z.boolean(),
    researchData: researchDataSchema
  }),
  outputSchema: z.object({
    report: z.string().optional(),
    completed: z.boolean()
  }),
  execute: async ({ inputData, mastra }) => {
    const approved = inputData.approved && !!inputData.researchData;
    if (!approved) {
      console.log(
        "リサーチが未承認または不完全のため、ワークフローを終了します。"
      );
      return { completed: false };
    }

    try {
      const agent = mastra.getAgent("reportAgent");
      const response = await agent.generate([
        {
          role: "user",
          content: `以下のリサーチ結果に基づいてレポートを生成してください：${JSON.stringify(inputData.researchData, null, 2)}`
        }
      ]);
      return {
        report: response.text,
        completed: true
      };
    } catch (e) {
      console.error("レポート生成エラー:", e);
      return {
        completed: false
      };
    }
  }
});

/**
 * 反復的にリサーチしてレポートを生成するワークフローを作成
 */
export const generateReportWorkflow = createWorkflow({
  id: "generate-report-workflow",
  steps: [researchWorkflow, processResearchResultStep],
  inputSchema: z.object({
    query: z.string()
  }),
  outputSchema: z.object({
    report: z.string().optional(),
    completed: z.boolean()
  })
});

generateReportWorkflow
  // 承認ワークフローで承認されるまで実施
  .dowhile(
    researchWorkflow,
    async ({ inputData }) => inputData.approved !== true
  )
  // 承認されたら結果を処理してレポートを生成
  .then(processResearchResultStep)
  .commit();
