import { z } from "zod";

export const architectureDecisionSchema = z.object({
  decision: z.string().min(5, "Decision title must be at least 5 characters"),
  reasoning: z.string().min(10, "Reasoning must be at least 10 characters"),
  alternative: z.string().optional().default(""),
  affectedAreas: z.array(z.string()).min(1, "Must list at least 1 affected area"),
});

export const systemComponentSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["frontend", "backend", "database", "queue", "cache", "external"]),
  description: z.string(),
  tech: z.string(),
});

export const dataModelSchema = z.object({
  entity: z.string().min(2),
  description: z.string(),
  fields: z.array(z.string()),
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
