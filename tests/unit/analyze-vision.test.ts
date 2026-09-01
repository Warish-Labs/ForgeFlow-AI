import { describe, it, expect } from "vitest";
import { requirementSynthesisSchema } from "@/lib/validations/ai";
import { createSynthesisGraph } from "@/lib/ai/graph";

describe("Analyze Vision State Graph & Schema Contract Suite", () => {
  it("1. Should validate requirementSynthesisSchema with suggestedTechStack and extractedFeatures", () => {
    const rawPayload = {
      problemStatement: "StudyPilot requires real-time document ingestion and AI flashcard generation.",
      suggestedTechStack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
      functionalRequirements: ["Allow users to upload PDFs for automatic study note extraction."],
      nonFunctionalRequirements: ["Response time under 500ms for flashcard generation."],
      extractedFeatures: [
        {
          title: "PDF Document Ingestion Engine",
          description: "Upload and parse study materials automatically.",
          phase: "MVP",
          priority: "HIGH",
        },
      ],
      assumptions: ["PostgreSQL is hosted on AWS RDS."],
      openQuestions: [],
    };

    const validated = requirementSynthesisSchema.parse(rawPayload);
    expect(validated.problemStatement).toContain("StudyPilot");
    expect(validated.suggestedTechStack).toContain("Next.js");
    expect(validated.extractedFeatures.length).toBe(1);
    expect(validated.assumptions.length).toBe(1);
  });

  it("2. Should fall back to suggestedStack if suggestedTechStack is provided as suggestedStack", () => {
    const rawPayload = {
      problemStatement: "StudyPilot requires real-time document ingestion and AI flashcard generation.",
      suggestedStack: ["Next.js", "PostgreSQL"],
      functionalRequirements: ["Upload study notes."],
      nonFunctionalRequirements: ["High availability."],
      extractedFeatures: [
        {
          title: "Smart Flashcards",
          description: "AI spaced repetition flashcards.",
          phase: "MVP",
          priority: "HIGH",
        },
      ],
    };

    const validated = requirementSynthesisSchema.parse(rawPayload);
    expect(validated.suggestedStack).toContain("Next.js");
    expect(validated.extractedFeatures.length).toBe(1);
  });

  it("3. Should invoke createSynthesisGraph and return state with result in mock offline mode", async () => {
    const graph = createSynthesisGraph();
    const result = await graph.invoke(
      {
        projectId: "proj_test_123",
        projectName: "StudyPilot",
        ideaText: "An AI study assistant using Next.js and PostgreSQL for flashcards.",
        userAnswers: {},
      },
      { configurable: { thread_id: "proj_test_123" } }
    );

    expect(result.status).toBe("COMPLETE");
    expect(result.result).not.toBeNull();
    expect(result.result?.problemStatement).toBeDefined();
    expect(result.result?.extractedFeatures.length).toBeGreaterThan(0);
  });
});
