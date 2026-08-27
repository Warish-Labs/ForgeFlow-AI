import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_OWNER_ID = "user_2demo_forgeflow_owner_001";

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.project.deleteMany({
    where: { ownerId: DEMO_OWNER_ID },
  });

  const project1 = await prisma.project.create({
    data: {
      ownerId: DEMO_OWNER_ID,
      name: "EcoTrack Fleet Analytics",
      ideaText:
        "Real-time carbon emission tracking system for commercial vehicle fleets using IoT sensors and automated reporting.",
      problemStatement: "Fleet operators lack real-time visibility into vehicle carbon output for ISO 14064 compliance.",
      techStack: ["Next.js 16", "PostgreSQL", "TimescaleDB", "LangGraph", "Tailwind CSS"],
      status: "ROADMAP_READY",
      features: {
        create: [
          {
            title: "Fleet Telemetry Ingestion",
            description:
              "Ingest high-frequency GPS and fuel consumption telemetry from vehicle OBD-II dongles via MQTT.",
            phase: "MVP",
            status: "planned",
          },
          {
            title: "Automated Carbon Credit Calculator",
            description:
              "Calculate daily carbon offset metrics against ISO 14064 standards and generate compliance certificates.",
            phase: "MVP",
            status: "planned",
          },
          {
            title: "Driver Efficiency Dashboard",
            description:
              "Real-time scoreboard displaying eco-driving metrics, idling time alerts, and route optimization suggestions.",
            phase: "PHASE_2",
            status: "planned",
          },
        ],
      },
      decisions: {
        create: [
          {
            decision: "TimescaleDB extension over standard PostgreSQL for telemetry",
            reasoning:
              "High-frequency IoT sensor data requires efficient time-series aggregation and hypertable partition pruning.",
            alternative: "Standard PostgreSQL tables with manual partition scripts.",
            affectedAreas: ["Database Layer", "Telemetry Pipeline"],
          },
          {
            decision: "MQTT Broker integration via AWS IoT Core",
            reasoning:
              "Decouples device connections from database writes, preventing database pool exhaustion during peak traffic.",
            alternative: "Direct HTTP POST endpoint from OBD-II dongles.",
            affectedAreas: ["Ingestion Service", "Security Layer"],
          },
        ],
      },
      roadmapItems: {
        create: [
          {
            title: "Core Schema & Telemetry Pipeline",
            phase: "MVP",
            status: "in_progress",
            dependsOn: [],
          },
          {
            title: "ISO Compliance Engine & Reports",
            phase: "PHASE_2",
            status: "todo",
            dependsOn: ["Core Schema & Telemetry Pipeline"],
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      ownerId: DEMO_OWNER_ID,
      name: "DevPulse AI Code Reviewer",
      ideaText:
        "Autonomous pull request code reviewer that analyzes security vulnerabilities, architectural diffs, and test coverage before human merge.",
      problemStatement: "Code review delays bottleneck high-velocity engineering teams.",
      techStack: ["Next.js 16", "LangGraph.js", "Groq", "Prisma", "GitHub REST API"],
      status: "PLANNING",
      features: {
        create: [
          {
            title: "GitHub Webhook Event Listener",
            description:
              "Receive pull_request.opened and pull_request.synchronize webhooks to trigger automated code inspection.",
            phase: "MVP",
            status: "planned",
          },
          {
            title: "Architectural Diff Impact Graph",
            description:
              "Construct AST dependency graph of changed files to highlight unintended side effects across modules.",
            phase: "PHASE_2",
            status: "planned",
          },
        ],
      },
      decisions: {
        create: [
          {
            decision: "Groq Llama-3.3-70B for zero-latency PR reviews",
            reasoning:
              "Developers require PR feedback within 15 seconds. Groq provides sub-second TTFT and high throughput.",
            alternative: "OpenAI GPT-4o with higher latency.",
            affectedAreas: ["AI Agent Layer"],
          },
        ],
      },
      roadmapItems: {
        create: [
          {
            title: "GitHub App Auth & Webhook Handler",
            phase: "MVP",
            status: "todo",
            dependsOn: [],
          },
        ],
      },
    },
  });

  console.log(`✅ Seed complete! Created project 1 (${project1.id}) and project 2 (${project2.id})`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
