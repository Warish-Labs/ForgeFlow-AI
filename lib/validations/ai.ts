import { z } from "zod";

export const extractedFeatureSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().optional().default(""),
  phase: z.enum(["MVP", "PHASE_2", "PHASE_3"]).default("MVP"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
});

export const requirementSynthesisSchema = z.object({
  problemStatement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters"),
  suggestedStack: z
    .array(z.string())
    .min(1, "Must suggest at least 1 technology"),
  functionalRequirements: z
    .array(z.string())
    .min(1, "Must include at least 1 functional requirement"),
  nonFunctionalRequirements: z
    .array(z.string())
    .min(1, "Must include at least 1 non-functional requirement"),
  extractedFeatures: z
    .array(extractedFeatureSchema)
    .min(1, "Must extract at least 1 feature"),
});

export type ExtractedFeature = z.infer<typeof extractedFeatureSchema>;
export type RequirementSynthesisResult = z.infer<typeof requirementSynthesisSchema>;
