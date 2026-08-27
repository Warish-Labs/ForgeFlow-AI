import { describe, it, expect } from "vitest";
import { generateMockArchitectureSynthesis } from "@/lib/ai/provider";
import { systemArchitectureSynthesisSchema } from "@/lib/validations/architecture";

describe("Architecture Synthesis & ADR Zod Validation", () => {
  it("should validate a complete system architecture & ADR payload", () => {
    const mockArch = generateMockArchitectureSynthesis("ForgeFlow AI", ["Next.js 16", "PostgreSQL"]);

    const validated = systemArchitectureSynthesisSchema.parse(mockArch);

    expect(validated.overview).toContain("ForgeFlow AI");
    expect(validated.components.length).toBeGreaterThan(0);
    expect(validated.dataModels.length).toBeGreaterThan(0);
    expect(validated.decisions.length).toBeGreaterThan(0);

    const adr = validated.decisions[0];
    expect(adr.decision).toBeDefined();
    expect(adr.reasoning.length).toBeGreaterThan(10);
    expect(adr.affectedAreas.length).toBeGreaterThan(0);
  });

  it("should reject architecture output missing required decision reasoning", () => {
    const invalidObj = {
      overview: "Valid overview paragraph here",
      components: [
        { name: "UI", type: "frontend", description: "Frontend app", tech: "React" },
      ],
      dataModels: [
        { entity: "User", description: "User entity", fields: ["id"] },
      ],
      decisions: [
        {
          decision: "Short",
          reasoning: "Too short", // Less than 10 characters
          affectedAreas: ["DB"],
        },
      ],
    };

    const parseResult = systemArchitectureSynthesisSchema.safeParse(invalidObj);
    expect(parseResult.success).toBe(false);
  });
});
