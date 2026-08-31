import { z } from "zod";

export type ToolName =
  | "run_python"
  | "run_javascript"
  | "run_typescript"
  | "search_web"
  | "generate_file"
  | "modify_project_state";

export interface PermissionRequestPayload {
  type: "permission_request";
  tool: ToolName;
  reason: string;
  args?: Record<string, unknown>;
  risk: "low" | "medium" | "high";
  requiresApproval: boolean;
}

export const permissionRequestSchema = z.object({
  type: z.literal("permission_request"),
  tool: z.enum([
    "run_python",
    "run_javascript",
    "run_typescript",
    "search_web",
    "generate_file",
    "modify_project_state",
  ]),
  reason: z.string().min(5),
  args: z.record(z.string(), z.unknown()).optional().default({}),
  risk: z.enum(["low", "medium", "high"]).default("low"),
  requiresApproval: z.boolean().default(true),
});

/**
 * Server-side tool execution gate.
 * Validates trust boundary: LLM -> Tool Request -> Server Validation -> User Permission -> Tool Execution
 */
export function validateToolExecutionPermission(
  payload: PermissionRequestPayload,
  isUserApproved: boolean
): { allowed: boolean; reason?: string } {
  if (!isUserApproved && payload.requiresApproval) {
    return { allowed: false, reason: "User explicitly denied tool permission request." };
  }

  // Safety checks per tool target
  if (payload.tool === "run_python" || payload.tool === "run_javascript" || payload.tool === "run_typescript") {
    // Note: Code execution is sandboxed or guarded
    return {
      allowed: isUserApproved,
      reason: isUserApproved
        ? "Code execution request approved by project owner."
        : "Code execution rejected by server policy.",
    };
  }

  if (payload.tool === "search_web") {
    return { allowed: true };
  }

  return { allowed: isUserApproved };
}
