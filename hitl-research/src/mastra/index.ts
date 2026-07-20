import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { researchWorkflow } from "./workflows/research-workflow";
import { queryEvaluationAgent } from "./agents/query-evaluation-agent";
import {
  MastraPlatformExporter,
  MastraStorageExporter,
  Observability,
  SensitiveDataFilter
} from "@mastra/observability";

export const mastra = new Mastra({
  workflows: { researchWorkflow },
  agents: { queryEvaluationAgent },
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: "file:../mastra.db"
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info"
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra",
        exporters: [new MastraStorageExporter(), new MastraPlatformExporter()],
        spanOutputProcessors: [new SensitiveDataFilter()]
      }
    }
  })
});
