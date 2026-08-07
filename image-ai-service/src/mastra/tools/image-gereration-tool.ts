import { Plan, PLAN_IMAGE_MODELS } from "@/lib/plans";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import z from "zod";
import { openai } from "@ai-sdk/openai";
import path from "path";
import * as fs from "fs";

export const imageGenerationTool = createTool({
  id: "image-generation-tool",
  description: `Generate an image from a text prompt using OpenAI native image generation`,
  inputSchema: z.object({
    prompt: z.string().describe("Text description of the image to generate")
  }),
  outputSchema: z.object({
    imageUrl: z.string().optional().describe("URL path to the generated image"),
    error: z
      .string()
      .optional()
      .describe("Error message if image generation failed")
  }),
  execute: async (inputData, context) => {
    try {
      // RequestContextからプランを取得（未設定時はfreeにフォールバック)
      const plan =
        (context?.requestContext?.get("plan") as Plan | undefined) ?? "free";
      const imageModel = PLAN_IMAGE_MODELS[plan];

      const imageAgent = new Agent({
        id: "image-generator",
        name: "Image Generator",
        model: imageModel,
        instructions:
          "Generate images as requested. Return only the image, no text",
        tools: {
          imageGenerationTool: openai.tools.imageGeneration({
            size: "1024x1024",
            quality: "medium",
            outputFormat: "png"
          })
        }
      });

      const result = await imageAgent.generate(inputData.prompt);
      const files = result.files;
      const file = files.at(0);
      if (!file) {
        return {
          error: "画像が生成されませんでした。別のプロンプトをお試しください。"
        };
      }

      const { payload } = file;
      // base64フィールドがない場合はpayload.dataから変換
      const fallbackBase64 =
        typeof payload.data === "string"
          ? payload.data
          : Buffer.from(payload.data).toString("base64");
      const base64 = payload.base64 ?? fallbackBase64;

      const uuid = crypto.randomUUID();
      const outputDir = path.join(process.cwd(), "public", "generated-images");
      const fileName = `${uuid}.png`;
      fs.mkdirSync(outputDir, { recursive: true });
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(base64, "base64"));

      return { imageUrl: `/generated-images/${fileName}` };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { error: `画像生成に失敗しました: ${message}` };
    }
  }
});
