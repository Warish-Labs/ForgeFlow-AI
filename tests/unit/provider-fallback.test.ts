import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  invokeLlmWithFallback,
  classifyLlmError,
  getGroqModel,
  getGeminiModel,
} from "@/lib/ai/provider";
import { HumanMessage } from "@langchain/core/messages";

// Mock LangChain Chat classes to prevent actual network calls during testing
vi.mock("@langchain/groq", () => {
  return {
    ChatGroq: vi.fn().mockImplementation((config: Record<string, unknown>) => {
      if (config.apiKey === "INVALID_GROQ_KEY") {
        throw new Error("401 Unauthorized: Invalid API Key");
      }
      if (config.model === "invalid-groq-model") {
        throw new Error("404 model_not_found: The model does not exist or you do not have access to it.");
      }
      return {
        invoke: vi.fn().mockImplementation(async () => {
          if (process.env.TEST_GROQ_FAIL_CODE === "404") {
            throw new Error("404 model_not_found: The model llama-3.3-70b-versatile does not exist");
          }
          if (process.env.TEST_GROQ_FAIL_CODE === "429") {
            throw new Error("429 Rate limit / quota exceeded");
          }
          if (process.env.TEST_GROQ_FAIL_CODE === "500") {
            throw new Error("500 Internal Server Error");
          }
          if (process.env.TEST_GROQ_FAIL_CODE === "ALL_FAIL") {
            throw new Error("Groq API general error");
          }
          return { content: "Groq response success" };
        }),
      };
    }),
  };
});

vi.mock("@langchain/google-genai", () => {
  return {
    ChatGoogleGenerativeAI: vi.fn().mockImplementation((config: Record<string, unknown>) => {
      if (config.apiKey === "INVALID_GEMINI_KEY") {
        throw new Error("403 Forbidden: Invalid Gemini API key");
      }
      return {
        invoke: vi.fn().mockImplementation(async () => {
          if (process.env.TEST_GEMINI_FAIL_CODE === "404") {
            throw new Error("404 model_not_found: Gemini model missing");
          }
          if (process.env.TEST_GEMINI_FAIL_CODE === "ALL_FAIL") {
            throw new Error("Gemini API general error");
          }
          return { content: "Gemini response success" };
        }),
      };
    }),
  };
});

describe("AI Provider Failover & Model Configuration Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("1. Should return Groq response when Groq succeeds", async () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "valid_groq_key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    delete process.env.TEST_GROQ_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Groq response success");
  });

  it("2. Should failover Groq 404 (model_not_found) -> Gemini success", async () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "valid_groq_key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    process.env.TEST_GROQ_FAIL_CODE = "404";
    delete process.env.TEST_GEMINI_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Gemini response success");
  });

  it("3. Should failover Groq 429 -> Gemini success", async () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "valid_groq_key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    process.env.TEST_GROQ_FAIL_CODE = "429";
    delete process.env.TEST_GEMINI_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Gemini response success");
  });

  it("4. Should failover Groq 5xx -> Gemini success", async () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "valid_groq_key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    process.env.TEST_GROQ_FAIL_CODE = "500";
    delete process.env.TEST_GEMINI_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Gemini response success");
  });

  it("5. Should return Gemini response when LLM_PROVIDER=gemini and Gemini succeeds", async () => {
    process.env.LLM_PROVIDER = "gemini";
    process.env.GROQ_API_KEY = "valid_groq_key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    delete process.env.TEST_GEMINI_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Gemini response success");
  });

  it("6. Should failover Gemini failure -> Groq success when LLM_PROVIDER=gemini", async () => {
    process.env.LLM_PROVIDER = "gemini";
    process.env.GROQ_API_KEY = "valid_groq_key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    process.env.TEST_GEMINI_FAIL_CODE = "ALL_FAIL";
    delete process.env.TEST_GROQ_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Groq response success");
  });

  it("7. Should throw useful combined diagnostic error when BOTH providers fail", async () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "valid_groq_key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    process.env.TEST_GROQ_FAIL_CODE = "404";
    process.env.TEST_GEMINI_FAIL_CODE = "ALL_FAIL";

    await expect(invokeLlmWithFallback([new HumanMessage("Hello")])).rejects.toThrow(
      /Primary provider Groq.*unavailable.*fallback provider Gemini.*failed/i
    );
  });

  it("8. Should failover to Groq when Gemini API key is missing and LLM_PROVIDER=gemini", async () => {
    process.env.LLM_PROVIDER = "gemini";
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    process.env.GROQ_API_KEY = "valid_groq_key";
    delete process.env.TEST_GROQ_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Groq response success");
  });

  it("9. Should failover to Gemini when Groq API key is missing and LLM_PROVIDER=groq", async () => {
    process.env.LLM_PROVIDER = "groq";
    delete process.env.GROQ_API_KEY;
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "valid_gemini_key";
    delete process.env.TEST_GEMINI_FAIL_CODE;

    const response = await invokeLlmWithFallback([new HumanMessage("Hello")]);
    expect(response).toBe("Gemini response success");
  });

  it("10. Should resolve default model IDs when GROQ_MODEL or GEMINI_MODEL env vars are omitted", () => {
    delete process.env.GROQ_MODEL;
    delete process.env.GEMINI_MODEL;

    expect(getGroqModel()).toBe("openai/gpt-oss-120b");
    expect(getGeminiModel()).toBe("gemini-2.5-flash");
  });

  it("11. Should correctly classify 404 model_not_found, 401 auth, 429 rate limit, 500 server errors", () => {
    const err404 = classifyLlmError({ message: "404 model_not_found: model does not exist", status: 404 });
    expect(err404.category).toBe("model_not_found");

    const err401 = classifyLlmError({ message: "401 Unauthorized", status: 401 });
    expect(err401.category).toBe("auth_error");

    const err429 = classifyLlmError({ message: "429 Rate limit / quota exceeded", status: 429 });
    expect(err429.category).toBe("rate_limit");

    const err500 = classifyLlmError({ message: "500 Internal server error", status: 500 });
    expect(err500.category).toBe("server_error");
  });
});
