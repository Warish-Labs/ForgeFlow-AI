import { describe, it, expect } from "vitest";
import { designSpecSchema } from "../../lib/validations/design";
import { permissionRequestSchema, validateToolExecutionPermission } from "../../lib/ai/tools";

describe("UI Design Spec Schema & Tool Permission Validation", () => {
  it("should validate a complete DesignSpec payload", () => {
    const validSpec = {
      themeName: "Obsidian Cyber",
      visualStyle: "Developer Tool",
      palette: [
        { name: "Background", hex: "#070A14", role: "Page Root Canvas" },
        { name: "Primary Accent", hex: "#1060EE", role: "Main Buttons" },
      ],
      typography: {
        fontFamily: "Inter, sans-serif",
        accentFont: "JetBrains Mono, monospace",
      },
      components: [
        {
          name: "Glass Workspace Panel",
          type: "card",
          spec: "1px border #1B2338 with hover glow",
          cssSnippet: "rounded-xl border border-[#1b2338] bg-[#0d1220]",
        },
      ],
      presetTags: ["Dark Mode", "Developer Tool"],
    };

    const parseResult = designSpecSchema.safeParse(validSpec);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.themeName).toBe("Obsidian Cyber");
      expect(parseResult.data.palette).toHaveLength(2);
    }
  });

  it("should reject malformed DesignSpec missing palette or components", () => {
    const invalidSpec = {
      themeName: "Invalid",
      palette: [], // Empty array violates min(1)
      components: [],
    };

    const parseResult = designSpecSchema.safeParse(invalidSpec);
    expect(parseResult.success).toBe(false);
  });

  it("should validate Tool Permission Request payload and user decision gate", () => {
    const validReq = {
      type: "permission_request",
      tool: "search_web",
      reason: "Research latest Next.js 16 features",
      args: { query: "Next.js 16 release notes" },
      risk: "low",
      requiresApproval: true,
    };

    const parseResult = permissionRequestSchema.safeParse(validReq);
    expect(parseResult.success).toBe(true);

    const approvedGate = validateToolExecutionPermission(validReq as any, true);
    expect(approvedGate.allowed).toBe(true);

    const deniedGate = validateToolExecutionPermission(
      { ...validReq, tool: "run_python" } as any,
      false
    );
    expect(deniedGate.allowed).toBe(false);
  });
});
