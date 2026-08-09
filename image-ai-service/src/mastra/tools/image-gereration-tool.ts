import { Plan, PLAN_IMAGE_MODELS } from "@/lib/plans";
import { createTool } from "@mastra/core/tools";
import z from "zod";
import { openai } from "@ai-sdk/openai";
import path from "path";
import * as fs from "fs";
import { generateImage } from "ai";

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

      const result = await generateImage({
        model: openai.image(imageModel),
        prompt: inputData.prompt,
        size: "1024x1024",
        providerOptions: {
          openai: {
            quality: "medium",
            outputFormat: "png"
          }
        }
      });
      const files = result.images;
      const file = files.at(0);
      if (!file) {
        return {
          error: "画像が生成されませんでした。別のプロンプトをお試しください。"
        };
      }

      const base64 = file.base64;
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
