import { z } from "zod";

export const colorTokenSchema = z.object({
  name: z.string().min(1),
  hex: z.string().min(3),
  role: z.string().min(1),
});

export const designComponentSpecSchema = z.object({
  name: z.string().min(1),
  type: z.string().default("component"),
  spec: z.string().min(1),
  cssSnippet: z.string().optional().default(""),
});

export const designSpecSchema = z.object({
  themeName: z.string().default("Obsidian Dark"),
  visualStyle: z.string().default("Developer Tool"),
  palette: z.array(colorTokenSchema).min(1, "Must include at least 1 color token"),
  typography: z.object({
    fontFamily: z.string().default("Inter, Geist Sans, sans-serif"),
    accentFont: z.string().default("JetBrains Mono, monospace"),
  }).default({
    fontFamily: "Inter, Geist Sans, sans-serif",
    accentFont: "JetBrains Mono, monospace",
  }),
  components: z.array(designComponentSpecSchema).min(1, "Must include at least 1 component spec"),
  presetTags: z.array(z.string()).default(["Dark Mode", "Developer Tool", "Electric Blue"]),
});

export type ColorToken = z.infer<typeof colorTokenSchema>;
export type DesignComponentSpec = z.infer<typeof designComponentSpecSchema>;
export type DesignSpec = z.infer<typeof designSpecSchema>;
