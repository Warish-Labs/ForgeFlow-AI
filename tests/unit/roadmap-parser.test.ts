import { describe, it, expect } from "vitest";
import { generateMockRoadmapSynthesis } from "@/lib/ai/provider";
import { roadmapSynthesisSchema } from "@/lib/validations/roadmap";

describe("Roadmap Synthesis & Dependency Zod Validation", () => {
  it("should validate a complete roadmap synthesis payload with dependencies", () => {
    const mockRoadmap = generateMockRoadmapSynthesis("ForgeFlow AI");

    const validated = roadmapSynthesisSchema.parse(mockRoadmap);

    expect(validated.overview).toContain("ForgeFlow AI");
    expect(validated.items.length).toBeGreaterThan(0);

    const item = validated.items[1];
    expect(item.title).toBeDefined();
    expect(item.phase).toBeDefined();
    expect(item.dependsOn).toBeInstanceOf(Array);
  });

  it("should reject roadmap items missing title or invalid phase enum", () => {
    const invalidObj = {
      overview: "Valid overview paragraph here",
      items: [
        {
          title: "Short", // Less than 5 characters
          phase: "INVALID_PHASE",
        },
      ],
    };

    const parseResult = roadmapSynthesisSchema.safeParse(invalidObj);
    expect(parseResult.success).toBe(false);
  });
});
