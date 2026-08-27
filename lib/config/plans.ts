// Centralized Free Tier and Plan System Config

export const PLAN_LIMITS = {
  FREE: {
    maxProjects: parseInt(process.env.FREE_MAX_PROJECTS || "1", 10),
    aiTokenLimit: parseInt(process.env.FREE_AI_TOKEN_LIMIT || "50000", 10),
    aiRequestLimit: parseInt(process.env.FREE_AI_REQUEST_LIMIT || "50", 10),
  },
  PREMIUM: {
    maxProjects: 9999,
    aiTokenLimit: 5000000,
    aiRequestLimit: 5000,
  },
};

export const ERROR_CODES = {
  FREE_PROJECT_LIMIT_REACHED: "FREE_PROJECT_LIMIT_REACHED",
  FREE_AI_QUOTA_EXCEEDED: "FREE_AI_QUOTA_EXCEEDED",
  PREMIUM_FEATURE: "PREMIUM_FEATURE",
  UNAUTHORIZED_ADMIN: "UNAUTHORIZED_ADMIN",
  AI_PROVIDER_FAILURE: "AI_PROVIDER_FAILURE",
  AI_VALIDATION_FAILURE: "AI_VALIDATION_FAILURE",
} as const;
