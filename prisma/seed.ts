import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_OWNER_ID = "user_2demo_forgeflow_owner_001";
const ADMIN_USER_1 = "user_3IVGfowfj67zugZfceNoVTfBMU9"; // warishdeveloper@gmail.com
const ADMIN_USER_2 = "user_3IY1GP1VleXNQ0e4oePZWY6KPec"; // warishlabs@gmail.com
const ADMIN_USER_3 = "user_3IUOqXgrlFU4KiKZxsSKlAtpsWi"; // warishansari018@gmail.com

async function main() {
  console.log("🌱 Seeding database for ForgeFlow AI...");

  // 1. Seed Users
  console.log("👤 Seeding Users...");
  await prisma.user.upsert({
    where: { id: ADMIN_USER_1 },
    create: { id: ADMIN_USER_1, email: "warishdeveloper@gmail.com", role: "SUPER_ADMIN" },
    update: { role: "SUPER_ADMIN" },
  });

  await prisma.user.upsert({
    where: { id: ADMIN_USER_2 },
    create: { id: ADMIN_USER_2, email: "warishlabs@gmail.com", role: "SUPER_ADMIN" },
    update: { role: "SUPER_ADMIN" },
  });

  await prisma.user.upsert({
    where: { id: ADMIN_USER_3 },
    create: { id: ADMIN_USER_3, email: "warishansari018@gmail.com", role: "SUPER_ADMIN" },
    update: { role: "SUPER_ADMIN" },
  });

  await prisma.user.upsert({
    where: { id: DEMO_OWNER_ID },
    create: { id: DEMO_OWNER_ID, email: "demo@forgeflow.ai", role: "USER" },
    update: {},
  });

  // 2. Seed Projects & Related Features, Decisions, Roadmap
  console.log("📁 Seeding Projects & Specifications...");
  await prisma.project.deleteMany({
    where: { ownerId: { in: [DEMO_OWNER_ID, ADMIN_USER_1] } },
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

  const project3 = await prisma.project.create({
    data: {
      ownerId: ADMIN_USER_1,
      name: "ForgeFlow AI Platform Governance",
      ideaText:
        "Enterprise platform for architectural specification, automated AI document synthesis, and multi-tenant quota governance.",
      problemStatement: "Engineering teams struggle with architectural consistency and AI expenditure tracking.",
      techStack: ["Next.js 16", "Prisma", "Clerk", "Groq", "Resend", "Tailwind CSS"],
      status: "ARCHITECTURE",
      features: {
        create: [
          {
            title: "Super Admin Governance Panel",
            description: "Unified telemetry dashboard monitoring user quotas, LLM token usage, and contact submissions.",
            phase: "MVP",
            status: "completed",
          },
        ],
      },
      decisions: {
        create: [
          {
            decision: "Server-side authorization guards on all server actions",
            reasoning: "Prevents unauthorized tenant access regardless of client UI state.",
            alternative: "Client-only route guards.",
            affectedAreas: ["Security Layer", "API Routes"],
          },
        ],
      },
      roadmapItems: {
        create: [
          {
            title: "Admin Panel & Telemetry Dashboard",
            phase: "MVP",
            status: "completed",
            dependsOn: [],
          },
        ],
      },
    },
  });

  // 3. Seed Documents
  console.log("📄 Seeding Documents...");
  await prisma.document.deleteMany({});
  await prisma.document.createMany({
    data: [
      {
        projectId: project1.id,
        ownerId: DEMO_OWNER_ID,
        type: "PRD",
        title: "Product Requirements Document (PRD) — EcoTrack",
        content: "# Product Requirements Document\n\n## Vision\nDeliver real-time carbon telemetry for commercial fleets...\n\n## Core Objectives\n- ISO 14064 Compliance\n- Real-time GPS & Fuel tracking\n- Automated PDF certificate generation",
        version: 1,
        status: "Generated",
      },
      {
        projectId: project1.id,
        ownerId: DEMO_OWNER_ID,
        type: "ARCHITECTURE",
        title: "Architecture Blueprint — EcoTrack System",
        content: "# System Architecture Blueprint\n\n```mermaid\ngraph TD\n  OBD[OBD-II Device] -->|MQTT| AWS[AWS IoT Core]\n  AWS --> Lambda[Telemetry Ingestion]\n  Lambda --> TSDB[(TimescaleDB)]\n```",
        version: 2,
        status: "Generated",
      },
      {
        projectId: project2.id,
        ownerId: DEMO_OWNER_ID,
        type: "SECURITY",
        title: "Security & Vulnerability Assessment — DevPulse",
        content: "# Security Assessment\n\n## Webhook Security\n- SHA-256 HMAC signature verification on all incoming GitHub webhooks.\n- Encrypted secrets in key vault.",
        version: 1,
        status: "Generated",
      },
      {
        projectId: project3.id,
        ownerId: ADMIN_USER_1,
        type: "BLUEPRINT",
        title: "ForgeFlow Platform System Blueprint",
        content: "# ForgeFlow AI Blueprint\n\nComprehensive technical specification for multi-tenant AI governance and agentic synthesis engine.",
        version: 1,
        status: "Generated",
      },
    ],
  });

  // 4. Seed AI Usage Logs
  console.log("📊 Seeding AI Usage Telemetry Logs...");
  await prisma.aiUsageLog.deleteMany({});
  await prisma.aiUsageLog.createMany({
    data: [
      {
        userId: ADMIN_USER_1,
        projectId: project3.id,
        operation: "architecture",
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        promptTokens: 1450,
        completionTokens: 2890,
        totalTokens: 4340,
        durationMs: 620,
        status: "success",
      },
      {
        userId: ADMIN_USER_1,
        projectId: project3.id,
        operation: "document",
        provider: "gemini",
        model: "gemini-2.5-flash",
        promptTokens: 2100,
        completionTokens: 3400,
        totalTokens: 5500,
        durationMs: 1100,
        status: "success",
      },
      {
        userId: DEMO_OWNER_ID,
        projectId: project1.id,
        operation: "chat",
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        promptTokens: 420,
        completionTokens: 850,
        totalTokens: 1270,
        durationMs: 290,
        status: "success",
      },
      {
        userId: DEMO_OWNER_ID,
        projectId: project2.id,
        operation: "roadmap",
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        promptTokens: 980,
        completionTokens: 1650,
        totalTokens: 2630,
        durationMs: 480,
        status: "success",
      },
      {
        userId: ADMIN_USER_3,
        projectId: null,
        operation: "analyze",
        provider: "tavily",
        model: "tavily-search",
        promptTokens: 150,
        completionTokens: 350,
        totalTokens: 500,
        durationMs: 310,
        status: "success",
      },
    ],
  });

  // 5. Seed Watchlist Subscribers
  console.log("📬 Seeding Priority Watchlist Subscribers...");
  await prisma.watchlist.deleteMany({});
  await prisma.watchlist.createMany({
    data: [
      { email: "sarah.connor@cyberdyne.io", source: "landing_modal", status: "active" },
      { email: "alex.chen@fintechflow.dev", source: "footer_form", status: "active" },
      { email: "dev.ops@cloudscale.org", source: "landing_modal", status: "active" },
      { email: "cto@innovatehealth.co", source: "blog_post", status: "active" },
    ],
  });

  // 6. Seed Contact Messages
  console.log("💬 Seeding Support Contact Messages...");
  await prisma.contactMessage.deleteMany({});
  const msg1 = await prisma.contactMessage.create({
    data: {
      name: "Marcus Vance",
      email: "marcus@vancecapital.com",
      subject: "Enterprise Tier Custom SLA Enquiry",
      message: "Hello ForgeFlow Team,\n\nWe are evaluating ForgeFlow AI for our team of 40 software architects. Do you support custom SOC2 compliance controls and self-hosted LLM deployments?",
      isRead: false,
    },
  });

  const msg2 = await prisma.contactMessage.create({
    data: {
      name: "Elena Rostova",
      email: "elena@nextgenlabs.de",
      subject: "Feedback on Architecture Blueprint Synthesis",
      message: "The Mermaid diagram generation for microservice dependencies is incredible! Is there an export option for draw.io format planned for future releases?",
      isRead: true,
      replies: {
        create: [
          {
            adminUserId: ADMIN_USER_1,
            adminEmail: "warishdeveloper@gmail.com",
            body: "Hi Elena,\n\nThank you for the wonderful feedback! Yes, draw.io XML export is currently on our Phase 2 roadmap.",
          },
        ],
      },
    },
  });

  // 7. Seed Model Pricing
  console.log("💲 Seeding Model Pricing...");
  await prisma.modelPricing.deleteMany({});
  await prisma.modelPricing.createMany({
    data: [
      {
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        inputPricePer1mTokens: 0.15,
        outputPricePer1mTokens: 0.60,
        createdByAdminId: ADMIN_USER_1,
      },
      {
        provider: "gemini",
        model: "gemini-2.5-flash",
        inputPricePer1mTokens: 0.075,
        outputPricePer1mTokens: 0.30,
        createdByAdminId: ADMIN_USER_1,
      },
    ],
  });

  // 8. Seed Audit Logs
  console.log("📜 Seeding Governance Audit Logs...");
  await prisma.auditLog.createMany({
    data: [
      {
        userId: ADMIN_USER_1,
        projectId: project3.id,
        action: "ADMIN_ACCESS",
        metadata: { page: "/admin" },
      },
      {
        userId: ADMIN_USER_1,
        projectId: project3.id,
        action: "DOCUMENT_GENERATED",
        metadata: { type: "BLUEPRINT", title: "ForgeFlow Platform System Blueprint" },
      },
    ],
  });

  console.log("✅ Seed completed successfully! All super admin panel tabs populated with live database data.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
