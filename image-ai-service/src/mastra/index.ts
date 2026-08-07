import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import {
  Observability,
  MastraStorageExporter,
  MastraPlatformExporter,
  SensitiveDataFilter
} from "@mastra/observability";
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
        serviceName: "mastra",
        exporters: [
          new MastraStorageExporter(), // Persists observability events to Mastra Storage
          new MastraPlatformExporter() // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter() // Redacts sensitive data like passwords, tokens, keys
        ]
      }
    }
  })
});
