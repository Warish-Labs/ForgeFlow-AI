import { z } from "zod";

export const architectureDecisionSchema = z.object({
  decision: z.string().min(5, "Decision title must be at least 5 characters"),
  reasoning: z.string().min(10, "Reasoning must be at least 10 characters"),
  alternative: z.string().optional().default(""),
  affectedAreas: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).min(1, "Must list at least 1 affected area")
  ),
});

export const systemComponentSchema = z.object({
  name: z.string().min(2),
  type: z.preprocess((val) => {
    if (typeof val === "string") {
      const s = val.toLowerCase();
      if (s.includes("front") || s.includes("ui") || s.includes("client")) return "frontend";
      if (s.includes("back") || s.includes("api") || s.includes("server")) return "backend";
      if (s.includes("db") || s.includes("data") || s.includes("store")) return "database";
      if (s.includes("queue") || s.includes("worker") || s.includes("event")) return "queue";
      if (s.includes("cache") || s.includes("redis")) return "cache";
    }
    return val;
  }, z.enum(["frontend", "backend", "database", "queue", "cache", "external"])),
  description: z.string().default(""),
  tech: z.string().default(""),
});

export const dataModelSchema = z.object({
  entity: z.string().min(2),
  description: z.string().default(""),
  fields: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string())
  ),
});

export const systemArchitectureSynthesisSchema = z.object({
  overview: z.string().min(10, "Overview must be at least 10 characters"),
  components: z.array(systemComponentSchema).min(1, "Must include at least 1 component"),
  dataModels: z.array(dataModelSchema).min(1, "Must include at least 1 data model"),
  decisions: z.array(architectureDecisionSchema).min(1, "Must include at least 1 ADR decision"),
});

export type ArchitectureDecision = z.infer<typeof architectureDecisionSchema>;
export type SystemComponent = z.infer<typeof systemComponentSchema>;
export type DataModel = z.infer<typeof dataModelSchema>;
export type SystemArchitectureSynthesisResult = z.infer<typeof systemArchitectureSynthesisSchema>;
