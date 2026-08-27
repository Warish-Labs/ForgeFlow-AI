import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch projects" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = createProjectSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: issue ? issue.message : "Invalid payload" } },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        name: parseResult.data.name,
        ideaText: parseResult.data.ideaText,
        problemStatement: parseResult.data.problemStatement ?? null,
        techStack: parseResult.data.techStack ?? [],
        status: "PLANNING",
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create project" } },
      { status: 500 }
    );
  }
}
