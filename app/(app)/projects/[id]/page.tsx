import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectByIdAction } from "@/lib/actions/project";
import { BlueprintProgressCard } from "@/components/overview/BlueprintProgressCard";
import { NextStepCard } from "@/components/overview/NextStepCard";
import { TechStackManager } from "@/components/stack/TechStackManager";
import { AssumptionsAndQuestions } from "@/components/overview/AssumptionsAndQuestions";
import { EditableSoftwareVision } from "@/components/overview/EditableSoftwareVision";
import {
  SparklesIcon,
  LayersIcon,
  DatabaseIcon,
  FileTextIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react";

interface ProjectOverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectOverviewPage({ params }: ProjectOverviewPageProps) {
  const { id } = await params;
  const project = await getProjectByIdAction(id);

  if (!project) {
    notFound();
  }

  const featureCount = project._count?.features ?? 0;
  const decisionCount = project._count?.decisions ?? 0;
  const roadmapCount = project._count?.roadmapItems ?? 0;
  const documentCount = project._count?.documents ?? 0;

  const stackList: string[] = Array.isArray(project.techStack)
    ? (project.techStack as string[])
    : [];

  const reqObj = (project.requirements as { functional?: string[]; nonFunctional?: string[] }) || {};
  const hasRequirements = Boolean(reqObj.functional && reqObj.functional.length > 0);
  const hasArchitecture = decisionCount > 0;
  const hasRoadmap = roadmapCount > 0;
  const hasDocuments = documentCount > 0;

  const assumptionsList: string[] = Array.isArray(project.assumptions)
    ? (project.assumptions as string[])
    : [];

  const openQuestionsList = Array.isArray(project.openQuestions)
    ? (project.openQuestions as Array<{ question: string; answer: string }>)
    : [];

  return (
    <div className="space-y-6 bg-[#000000] text-[#f8fafc] pb-12">
      {/* Dynamic Next Step Workflow Guidance */}
      <NextStepCard
        projectId={project.id}
        hasRequirements={hasRequirements}
        hasArchitecture={hasArchitecture}
        hasRoadmap={hasRoadmap}
        hasDocuments={hasDocuments}
      />

      {/* Blueprint Progress Checklist */}
      <BlueprintProgressCard
        hasVision={Boolean(project.ideaText)}
        hasRequirements={hasRequirements}
        hasFeatures={featureCount > 0}
        hasStack={stackList.length > 0}
        hasArchitecture={hasArchitecture}
        hasRoadmap={hasRoadmap}
        documentsCount={documentCount}
      />

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-mono uppercase text-[#64748b]">Features</p>
            <p className="text-2xl font-bold text-[#38bdf8] mt-1">{featureCount}</p>
          </div>
          <div className="h-9 w-9 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
            <SparklesIcon className="h-4 w-4 text-[#38bdf8]" />
          </div>
        </div>

        <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-mono uppercase text-[#64748b]">ADRs</p>
            <p className="text-2xl font-bold text-[#38bdf8] mt-1">{decisionCount}</p>
          </div>
          <div className="h-9 w-9 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
            <LayersIcon className="h-4 w-4 text-[#38bdf8]" />
          </div>
        </div>

        <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-mono uppercase text-[#64748b]">Roadmap</p>
            <p className="text-2xl font-bold text-[#38bdf8] mt-1">{roadmapCount}</p>
          </div>
          <div className="h-9 w-9 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
            <DatabaseIcon className="h-4 w-4 text-[#38bdf8]" />
          </div>
        </div>

        <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-mono uppercase text-[#64748b]">Docs</p>
            <p className="text-2xl font-bold text-[#38bdf8] mt-1">{documentCount}</p>
          </div>
          <div className="h-9 w-9 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
            <FileTextIcon className="h-4 w-4 text-[#38bdf8]" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Software Vision Card (Editable) */}
          <EditableSoftwareVision
            projectId={project.id}
            initialIdeaText={project.ideaText}
            initialProblemStatement={project.problemStatement || ""}
          />

          {/* Technology Stack Manager */}
          <TechStackManager projectId={project.id} initialStack={stackList} />

          {/* Open Questions & Assumptions */}
          <AssumptionsAndQuestions
            projectId={project.id}
            initialAssumptions={assumptionsList}
            initialQuestions={openQuestionsList}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#3b82f6]/20 bg-[#050814] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#3b82f6]/20 pb-2">
              <h3 className="text-xs font-semibold text-[#f8fafc]">
                Planned Features
              </h3>
              <Link
                href={`/projects/${project.id}/features`}
                className="text-[11px] text-[#38bdf8] hover:underline font-mono inline-flex items-center gap-1"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-2">
              {project.features.length > 0 ? (
                project.features.slice(0, 4).map((feat) => (
                  <div
                    key={feat.id}
                    className="flex items-start gap-2 rounded border border-[#3b82f6]/15 bg-[#0b1120] p-2.5 text-xs"
                  >
                    {feat.status === "completed" ? (
                      <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <ClockIcon className="h-3.5 w-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-[#f8fafc] text-xs">{feat.title}</p>
                      {feat.description && (
                        <p className="text-[11px] text-[#64748b] line-clamp-1">
                          {feat.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748b] italic py-2">
                  No features extracted yet. Use Features tab or run AI Requirements Analysis.
                </p>
              )}
            </div>
          </div>

          {/* Key Decisions */}
          <div className="rounded-xl border border-[#3b82f6]/20 bg-[#050814] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#3b82f6]/20 pb-2">
              <h3 className="text-xs font-semibold text-[#f8fafc]">
                Architectural Decisions
              </h3>
              <Link
                href={`/projects/${project.id}/architecture`}
                className="text-[11px] text-[#38bdf8] hover:underline font-mono inline-flex items-center gap-1"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-2">
              {project.decisions.length > 0 ? (
                project.decisions.slice(0, 3).map((dec) => (
                  <div
                    key={dec.id}
                    className="rounded border border-[#3b82f6]/15 bg-[#0b1120] p-3 text-xs space-y-1"
                  >
                    <span className="font-semibold text-[#f8fafc] block">
                      {dec.decision}
                    </span>
                    <p className="text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">
                      {dec.reasoning}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748b] italic py-2">
                  No ADR records synthesized yet. Run AI Architecture synthesis.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
