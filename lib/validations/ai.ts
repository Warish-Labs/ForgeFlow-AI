import { z } from "zod";

export const extractedFeatureSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().optional().default(""),
  phase: z.preprocess((val) => {
    if (typeof val === "string") {
      const s = val.toUpperCase().replace(/\s+/g, "_");
      if (s.includes("MVP") || s.includes("1")) return "MVP";
      if (s.includes("2")) return "PHASE_2";
      if (s.includes("3")) return "PHASE_3";
    }
    return val;
  }, z.enum(["MVP", "PHASE_2", "PHASE_3"]).default("MVP")),
  priority: z.preprocess((val) => {
    if (typeof val === "string") {
      const s = val.toUpperCase();
      if (s.includes("HIGH")) return "HIGH";
      if (s.includes("MED")) return "MEDIUM";
      if (s.includes("LOW")) return "LOW";
    }
    return val;
  }, z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH")),
});

export const requirementSynthesisSchema = z.object({
  problemStatement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters"),
  suggestedStack: z.preprocess(
    (val) => (typeof val === "string" ? [val] : Array.isArray(val) ? val : []),
    z.array(z.string()).default([])
  ),
  suggestedTechStack: z.preprocess(
    (val) => (typeof val === "string" ? [val] : Array.isArray(val) ? val : []),
    z.array(z.string()).default([])
  ),
  functionalRequirements: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).min(1, "Must include at least 1 functional requirement")
  ),
  nonFunctionalRequirements: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).min(1, "Must include at least 1 non-functional requirement")
  ),
  extractedFeatures: z
    .array(extractedFeatureSchema)
    .min(1, "Must extract at least 1 feature"),
  assumptions: z.preprocess(
    (val) => (typeof val === "string" ? [val] : Array.isArray(val) ? val : []),
    z.array(z.string()).default([])
  ),
  openQuestions: z.array(z.unknown()).default([]),
});

export const questionTypeSchema = z.enum(["single_select", "multi_select", "free_text", "yes_no"]);

export const questionItemSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
});

export const askUserPayloadSchema = z.object({
  questions: z.array(questionItemSchema).min(1),
});

export const answerSubmissionSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  answers: z.record(z.string(), z.unknown()),
});

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type QuestionItem = z.infer<typeof questionItemSchema>;
export type AskUserPayload = z.infer<typeof askUserPayloadSchema>;

export type ExtractedFeature = z.infer<typeof extractedFeatureSchema>;
export type RequirementSynthesisResult = z.infer<typeof requirementSynthesisSchema>;

export interface AnswerValidationResult {
  isValid: boolean;
  missingQuestions: string[]; // Question IDs that are missing or invalid
  errors: Record<string, string>; // Question ID -> user friendly error message
  generalError: string | null;
}

/**
 * Validate user answers against question specifications
 */
export function validateQuestionnaireAnswers(
  questions: QuestionItem[],
  answers: Record<string, unknown>
): AnswerValidationResult {
  const missingQuestions: string[] = [];
  const errors: Record<string, string> = {};

  if (!questions || questions.length === 0) {
    return { isValid: true, missingQuestions: [], errors: {}, generalError: null };
  }

  for (const q of questions) {
    const val = answers[q.id];

    if (q.type === "single_select") {
      if (typeof val !== "string" || !val.trim()) {
        missingQuestions.push(q.id);
        errors[q.id] = `Please select an option for "${q.prompt}"`;
      } else if (q.options && q.options.length > 0 && !q.options.includes(val)) {
        missingQuestions.push(q.id);
        errors[q.id] = `Selected option "${val}" is invalid for "${q.prompt}"`;
      }
    } else if (q.type === "multi_select") {
      if (!Array.isArray(val) || val.length === 0) {
        missingQuestions.push(q.id);
        errors[q.id] = `Please select at least one option for "${q.prompt}"`;
      } else if (q.options && q.options.length > 0) {
        const invalidItems = val.filter((item) => typeof item !== "string" || !q.options!.includes(item));
        if (invalidItems.length > 0) {
          missingQuestions.push(q.id);
          errors[q.id] = `Selected option(s) invalid for "${q.prompt}"`;
        }
      }
    } else if (q.type === "free_text") {
      if (typeof val !== "string" || !val.trim()) {
        missingQuestions.push(q.id);
        errors[q.id] = `Please provide an answer for "${q.prompt}"`;
      }
    } else if (q.type === "yes_no") {
      if (typeof val !== "boolean") {
        missingQuestions.push(q.id);
        errors[q.id] = `Please select Yes or No for "${q.prompt}"`;
      }
    }
  }

  const isValid = missingQuestions.length === 0;
  const generalError = isValid
    ? null
    : `Please answer all required questions before continuing. (${missingQuestions.length} ${
        missingQuestions.length === 1 ? "question still needs an answer" : "questions still need an answer"
      })`;

  return {
    isValid,
    missingQuestions,
    errors,
    generalError,
  };
}

