import { describe, it, expect, vi } from "vitest";
import { validateQuestionnaireAnswers, QuestionItem, answerSubmissionSchema } from "@/lib/validations/ai";

describe("Questionnaire Submission & Synthesis Resume Flow Test Suite", () => {
  const sampleQuestions: QuestionItem[] = [
    {
      id: "db_choice",
      type: "single_select",
      prompt: "Which database engine should this project use?",
      options: ["PostgreSQL", "MySQL", "SQLite"],
      reasoning: "Database selection determines ORM configuration.",
    },
    {
      id: "hosting_choice",
      type: "single_select",
      prompt: "Where do you plan to host the application in production?",
      options: ["Vercel", "AWS ECS", "Render.com"],
      reasoning: "Hosting choice determines deployment pipeline.",
    },
    {
      id: "auth_requirement",
      type: "yes_no",
      prompt: "Do you require social OAuth authentication?",
      reasoning: "OAuth integration requires Clerk or NextAuth setup.",
    },
    {
      id: "custom_notes",
      type: "free_text",
      prompt: "Any specific custom infrastructure preferences?",
      reasoning: "Allows custom user overrides.",
    },
  ];

  it("1. Should validate complete valid user answers successfully", () => {
    const validAnswers = {
      db_choice: "PostgreSQL",
      hosting_choice: "Vercel",
      auth_requirement: true,
      custom_notes: "Prefer Docker containerization for background workers.",
    };

    const result = validateQuestionnaireAnswers(sampleQuestions, validAnswers);
    expect(result.isValid).toBe(true);
    expect(result.missingQuestions.length).toBe(0);
    expect(result.generalError).toBeNull();
  });

  it("2. Should catch missing required single_select answer and return detailed validation error", () => {
    const incompleteAnswers = {
      db_choice: "PostgreSQL",
      // hosting_choice missing
      auth_requirement: true,
      custom_notes: "Some notes",
    };

    const result = validateQuestionnaireAnswers(sampleQuestions, incompleteAnswers);
    expect(result.isValid).toBe(false);
    expect(result.missingQuestions).toContain("hosting_choice");
    expect(result.generalError).toContain("1 question still needs an answer");
    expect(result.errors["hosting_choice"]).toContain("Where do you plan to host");
  });

  it("3. Should reject invalid single_select option not in allowed options list", () => {
    const invalidAnswers = {
      db_choice: "OracleDB", // Not in options
      hosting_choice: "Vercel",
      auth_requirement: true,
      custom_notes: "Notes",
    };

    const result = validateQuestionnaireAnswers(sampleQuestions, invalidAnswers);
    expect(result.isValid).toBe(false);
    expect(result.missingQuestions).toContain("db_choice");
    expect(result.errors["db_choice"]).toContain("invalid");
  });

  it("4. Should catch empty free_text answer", () => {
    const emptyTextAnswers = {
      db_choice: "PostgreSQL",
      hosting_choice: "Vercel",
      auth_requirement: true,
      custom_notes: "   ", // Empty whitespace
    };

    const result = validateQuestionnaireAnswers(sampleQuestions, emptyTextAnswers);
    expect(result.isValid).toBe(false);
    expect(result.missingQuestions).toContain("custom_notes");
  });

  it("5. Should validate server payload schema with answerSubmissionSchema", () => {
    const validPayload = {
      projectId: "proj_clrk_123",
      answers: {
        db_choice: "PostgreSQL",
        hosting_choice: "Vercel",
      },
    };

    const parsed = answerSubmissionSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);

    const invalidPayload = {
      projectId: "", // empty
      answers: "not an object",
    };
    const invalidParsed = answerSubmissionSchema.safeParse(invalidPayload);
    expect(invalidParsed.success).toBe(false);
  });
});
