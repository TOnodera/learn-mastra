import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { Observability, MastraStorageExporter } from "@mastra/observability";
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
        exporters: [new MastraStorageExporter()]
      }
    }
  })
});
