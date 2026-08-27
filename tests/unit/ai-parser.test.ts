import { describe, it, expect } from "vitest";
import { cleanJsonText, generateMockRequirementSynthesis } from "@/lib/ai/provider";
import { requirementSynthesisSchema } from "@/lib/validations/ai";

describe("AI Output Cleaning & Zod Schema Validation Guard", () => {
  it("should strip markdown code block wrapping from raw LLM responses", () => {
    const rawMarkdownJson = `\`\`\`json
{
  "problemStatement": "Test problem statement",
  "suggestedStack": ["Next.js", "PostgreSQL"],
  "functionalRequirements": ["Requirement 1"],
  "nonFunctionalRequirements": ["NFR 1"],
  "extractedFeatures": [
    {
      "title": "Auth Guard",
      "description": "User authentication",
      "phase": "MVP",
      "priority": "HIGH"
    }
  ]
}
\`\`\``;

    const cleaned = cleanJsonText(rawMarkdownJson);
    expect(cleaned).not.toContain("```");
    expect(cleaned).not.toContain("json");

    const parsed = JSON.parse(cleaned);
    const validated = requirementSynthesisSchema.parse(parsed);

    expect(validated.problemStatement).toBe("Test problem statement");
    expect(validated.suggestedStack).toEqual(["Next.js", "PostgreSQL"]);
    expect(validated.extractedFeatures).toHaveLength(1);
  });

  it("should reject malformed LLM outputs missing required fields", () => {
    const invalidObj = {
      problemStatement: "Short", // Less than 10 chars
      suggestedStack: [], // Empty array violates min(1)
    };

    const parseResult = requirementSynthesisSchema.safeParse(invalidObj);
    expect(parseResult.success).toBe(false);
  });

  it("should generate a valid fallback synthesis matching Zod schema when offline", () => {
    const mockData = generateMockRequirementSynthesis("Test vision prompt", "Test App");

    const validated = requirementSynthesisSchema.parse(mockData);
    expect(validated.suggestedStack.length).toBeGreaterThan(0);
    expect(validated.functionalRequirements.length).toBeGreaterThan(0);
    expect(validated.extractedFeatures.length).toBeGreaterThan(0);
  });
});
