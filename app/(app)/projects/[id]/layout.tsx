import { notFound } from "next/navigation";
import { getProjectByIdAction } from "@/lib/actions/project";
import { ProjectWorkspaceHeader } from "./ProjectWorkspaceHeader";

export const dynamic = "force-dynamic";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;
  const project = await getProjectByIdAction(id);

  // Single-tenant security guard: return 404 if project doesn't exist OR user is not owner
  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface-base)]">
      {/* Workspace Header with Project Title & Tab Navigation */}
      <ProjectWorkspaceHeader project={project} />

      {/* Workspace Main Content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
