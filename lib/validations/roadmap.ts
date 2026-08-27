import { z } from "zod";

export const roadmapItemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  phase: z.enum(["MVP", "PHASE_2", "PHASE_3"]).default("MVP"),
  status: z.string().default("todo"),
  dependsOn: z.array(z.string()).default([]),
  estimatedDays: z.number().optional().default(1),
});

export const roadmapSynthesisSchema = z.object({
  overview: z.string().min(10, "Overview must be at least 10 characters"),
  items: z.array(roadmapItemSchema).min(1, "Must include at least 1 roadmap milestone"),
});

export type RoadmapItemInput = z.infer<typeof roadmapItemSchema>;
export type RoadmapSynthesisResult = z.infer<typeof roadmapSynthesisSchema>;
