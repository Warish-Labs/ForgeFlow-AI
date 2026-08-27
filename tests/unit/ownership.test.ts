import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @clerk/nextjs/server auth()
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock Prisma client
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getProjectByIdAction, deleteProjectAction } from "@/lib/actions/project";

describe("Single-Tenant Project Ownership Security Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return project when authenticated user is the project owner", async () => {
    // User A authenticates
    vi.mocked(auth).mockResolvedValue({ userId: "user_owner_A" } as any);

    const mockProject = {
      id: "project_100",
      ownerId: "user_owner_A",
      title: "EcoTrack API",
      description: "Fleet telemetry system",
      targetStack: ["Next.js"],
      status: "IN_PROGRESS",
      features: [],
      decisions: [],
      roadmapItems: [],
      _count: { features: 0, decisions: 0, roadmapItems: 0, documents: 0 },
    };

    vi.mocked(prisma.project.findFirst).mockResolvedValue(mockProject as any);

    const result = await getProjectByIdAction("project_100");

    expect(auth).toHaveBeenCalled();
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: "project_100",
        ownerId: "user_owner_A", // Strict ownership isolation check
      },
      include: expect.any(Object),
    });
    expect(result).toEqual(mockProject);
  });

  it("should return null (404 guard) when user tries to access another user's project", async () => {
    // User B authenticates and tries to access User A's project
    vi.mocked(auth).mockResolvedValue({ userId: "user_attacker_B" } as any);

    // Prisma query returns null because ownerId filter does not match user_attacker_B
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const result = await getProjectByIdAction("project_100");

    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: "project_100",
        ownerId: "user_attacker_B",
      },
      include: expect.any(Object),
    });
    expect(result).toBeNull();
  });

  it("should prevent non-owner from deleting another user's project", async () => {
    // User B tries to delete User A's project
    vi.mocked(auth).mockResolvedValue({ userId: "user_attacker_B" } as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const result = await deleteProjectAction("project_100");

    expect(result).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Project not found or access denied",
      },
    });
    expect(prisma.project.delete).not.toHaveBeenCalled();
  });
});
