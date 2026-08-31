import { z } from "zod";

export const roadmapItemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  phase: z.preprocess((val) => {
    if (typeof val === "string") {
      const s = val.toUpperCase().replace(/\s+/g, "_");
      if (s.includes("MVP") || s.includes("1")) return "MVP";
      if (s.includes("2")) return "PHASE_2";
      if (s.includes("3")) return "PHASE_3";
    }
    return val;
  }, z.enum(["MVP", "PHASE_2", "PHASE_3"]).default("MVP")),
  status: z.string().default("todo"),
  dependsOn: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).default([])
  ),
  estimatedDays: z.coerce.number().optional().default(1),
});

export const roadmapSynthesisSchema = z.object({
  overview: z.string().min(10, "Overview must be at least 10 characters"),
  items: z.array(roadmapItemSchema).min(1, "Must include at least 1 roadmap milestone"),
});

export type RoadmapItemInput = z.infer<typeof roadmapItemSchema>;
export type RoadmapSynthesisResult = z.infer<typeof roadmapSynthesisSchema>;
