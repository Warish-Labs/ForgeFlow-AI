import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Helper to ensure .env / .env.local variables are loaded when executed directly via CLI
function loadEnvFiles() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...valueParts] = trimmed.split("=");
          const k = key.trim();
          let v = valueParts.join("=").trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      });
    }
  }

  // Ensure DIRECT_URL falls back to DATABASE_URL if omitted in Vercel environment settings
  if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
}

loadEnvFiles();

async function runDeploy() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "⚠️ DATABASE_URL is not set in environment variables. Skipping database migration/seeding."
    );
    return;
  }

  console.log("🚀 Running database migrations...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
    console.log("✅ Database migrations applied successfully.");
  } catch (error) {
    console.error("❌ Prisma migration failed:", error);
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log("🔍 Checking if initial database seeding is required...");
    const projectCount = await prisma.project.count();

    if (projectCount === 0) {
      console.log("🌱 Database is empty (0 projects found). Running seed script for first deployment...");
      execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });
      console.log("✅ First-time seed executed successfully.");
    } else {
      console.log(`ℹ️ Seed skipped: Database already initialized with ${projectCount} project(s).`);
    }
  } catch (error) {
    console.error("⚠️ Error checking or running seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runDeploy();
