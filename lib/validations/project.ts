import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(80, "Project name must be 80 characters or less")
    .trim(),
  ideaText: z
    .string()
    .min(10, "Software idea must be at least 10 characters")
    .max(2000, "Software idea must be 2000 characters or less")
    .trim(),
  problemStatement: z.string().optional(),
  techStack: z.array(z.string()).optional().default([]),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(80, "Project name must be 80 characters or less")
    .trim()
    .optional(),
  ideaText: z
    .string()
    .min(10, "Software idea must be at least 10 characters")
    .max(2000, "Software idea must be 2000 characters or less")
    .trim()
    .optional(),
  problemStatement: z.string().optional(),
  status: z.enum(["PLANNING", "ARCHITECTURE", "ROADMAP_READY", "EXPORTED"]).optional(),
  techStack: z.array(z.string()).optional(),
  requirements: z.any().optional(),
  architectureText: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
