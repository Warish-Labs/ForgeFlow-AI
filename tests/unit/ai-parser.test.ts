import { describe, it, expect } from "vitest";
import { cleanJsonText, generateMockRequirementSynthesis } from "@/lib/ai/provider";
import { requirementSynthesisSchema } from "@/lib/validations/ai";
import { buildChatSystemPrompt } from "../../lib/ai/prompts/chat";

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

  it("should parse structured proposal block embedded in LLM completion text", () => {
    const llmCompletionText = `I recommend updating your database configuration to PostgreSQL.

\`\`\`json
{
  "type": "STACK_CHANGE",
  "summary": "Switch database engine to PostgreSQL",
  "targetField": "techStack",
  "newValue": ["Next.js", "PostgreSQL", "Prisma"],
  "affectedAreas": ["Database Schema", "Architecture"],
  "reasoning": "PostgreSQL provides robust relational integrity and ACID compliance."
}
\`\`\``;

    const jsonMatch = llmCompletionText.match(/```json\s*([\s\S]*?)\s*```/);
    expect(jsonMatch).not.toBeNull();
    const parsed = JSON.parse(jsonMatch![1]);

    expect(parsed.type).toBe("STACK_CHANGE");
    expect(parsed.targetField).toBe("techStack");
    expect(parsed.newValue).toContain("PostgreSQL");
    expect(parsed.reasoning).toBeDefined();
  });

  it("REGRESSION: should build unique, distinct system prompts for different project contexts", () => {
    const promptA = buildChatSystemPrompt({
      projectId: "proj-1",
      projectName: "Project Alpha",
      ideaText: "Build a real-time IoT monitoring service with Socket.io and Redis",
      techStack: ["Node.js", "Redis", "Socket.io"],
      featureCount: 3,
      decisions: [],
      roadmapItems: [],
    });

    const promptB = buildChatSystemPrompt({
      projectId: "proj-2",
      projectName: "Project Beta",
      ideaText: "Build an e-commerce platform with Next.js and Stripe",
      techStack: ["Next.js", "Stripe", "PostgreSQL"],
      featureCount: 5,
      decisions: [],
      roadmapItems: [],
    });

    expect(promptA).not.toEqual(promptB);
    expect(promptA).toContain("Project Alpha");
    expect(promptB).toContain("Project Beta");
    expect(promptA).toContain("Socket.io");
    expect(promptB).toContain("Stripe");
  });

  it("should parse NEEDS_INPUT questionnaire payload without throwing schema error", () => {
    const needsInputJson = `{
      "status": "NEEDS_INPUT",
      "questions": [
        {
          "id": "db_choice",
          "type": "single_select",
          "prompt": "Which database engine should this project use?",
          "options": ["PostgreSQL", "MySQL"],
          "reasoning": "Database engine selection impacts ORM configuration."
        }
      ]
    }`;

    const cleaned = cleanJsonText(needsInputJson);
    const parsed = JSON.parse(cleaned);

    expect(parsed.status).toBe("NEEDS_INPUT");
    expect(parsed.questions).toHaveLength(1);
    expect(parsed.questions[0].id).toBe("db_choice");
  });

  it("should extract and validate target project features for database persistence", () => {
    const rawSynthesisJson = `{
      "problemStatement": "StudyPilot is an AI learning assistant that organizes study materials and automates flashcard creation.",
      "suggestedStack": ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "OpenAI"],
      "functionalRequirements": ["Users can upload PDF study guides.", "AI generates interactive flashcards and quizzes."],
      "nonFunctionalRequirements": ["Sub-200ms latency for flashcard generation."],
      "extractedFeatures": [
        {
          "title": "PDF Document Ingestion & Text Extraction",
          "description": "Parses PDF files and extracts raw study notes.",
          "phase": "MVP",
          "priority": "HIGH"
        },
        {
          "title": "Automated Flashcard & Quiz Generator",
          "description": "Generates spaced repetition study decks using LLM.",
          "phase": "MVP",
          "priority": "HIGH"
        }
      ]
    }`;

    const cleaned = cleanJsonText(rawSynthesisJson);
    const parsed = JSON.parse(cleaned);
    const validated = requirementSynthesisSchema.parse(parsed);

    expect(validated.extractedFeatures).toHaveLength(2);
    expect(validated.extractedFeatures[0].title).toBe("PDF Document Ingestion & Text Extraction");
    expect(validated.extractedFeatures[1].title).toBe("Automated Flashcard & Quiz Generator");

    // Test DB payload mapping
    const dbFeatures = validated.extractedFeatures.map((feat) => ({
      projectId: "test-proj",
      title: feat.title,
      description: feat.description || "",
      phase: feat.phase || "MVP",
      status: "planned",
    }));

    expect(dbFeatures).toHaveLength(2);
    expect(dbFeatures[0].projectId).toBe("test-proj");
    expect(dbFeatures[0].phase).toBe("MVP");
  });
});
