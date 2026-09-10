import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import {
  Observability,
  MastraStorageExporter,
  SamplingStrategyType
} from "@mastra/observability";

import { LangfuseExporter } from "@mastra/langfuse";
import { imageSupportAgent } from "./agents/image-support-agent";

export const mastra = new Mastra({
  agents: { "image-support-agent": imageSupportAgent },
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: "file:./mastra.db"
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "debug"
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "image-ai-service",
        exporters: [
          new MastraStorageExporter(),
          new LangfuseExporter({
            publicKey: process.env.LANGFUSE_PUBLIC_KEY,
            secretKey: process.env.LANGFUSE_SECRET_KEY,
            baseUrl: process.env.LANGFUSE_BASE_URL
          })
        ],
        sampling: {
          type: SamplingStrategyType.ALWAYS
        },
        serializationOptions: {
          maxStringLength: 4194304,
          maxDepth: 12,
          maxArrayLength: 200
        }
      }
    }
  })
});
