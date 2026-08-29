import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Helper to sanitize database URLs in log messages to prevent secret leaks
function sanitizeText(text: string): string {
  if (!text) return "";
  return text.replace(/:[^:@]+@/g, ":****@");
}

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
    console.warn("⚠️ DIRECT_URL is not set. Defaulting DIRECT_URL to DATABASE_URL.");
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

  // Debug log environment status safely without printing passwords
  const sanitizedDbUrl = sanitizeText(process.env.DATABASE_URL);
  const sanitizedDirectUrl = sanitizeText(process.env.DIRECT_URL || "");
  console.log(`ℹ️ DATABASE_URL configured: ${sanitizedDbUrl}`);
  console.log(`ℹ️ DIRECT_URL configured: ${sanitizedDirectUrl}`);

  if (process.env.DIRECT_URL && process.env.DIRECT_URL.includes("-pooler")) {
    console.warn(
      "⚠️ WARNING: DIRECT_URL appears to contain '-pooler'. Prisma migrations require a direct connection, not a pooled connection!"
    );
  }

  console.log("🚀 Running database migrations...");
  try {
    const output = execSync("npx prisma migrate deploy", {
      encoding: "utf-8",
      env: process.env,
      stdio: "pipe",
    });
    console.log(sanitizeText(output));
    console.log("✅ Database migrations applied successfully.");
  } catch (error: any) {
    console.error("❌ Prisma migration failed!");
    if (error.stdout) {
      console.error("📋 Prisma Migration STDOUT:\n" + sanitizeText(error.stdout.toString()));
    }
    if (error.stderr) {
      console.error("🚨 Prisma Migration STDERR:\n" + sanitizeText(error.stderr.toString()));
    }
    if (error.message) {
      console.error("💥 Execution Error Message:\n" + sanitizeText(error.message));
    }
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log("🔍 Checking if initial database seeding is required...");
    const projectCount = await prisma.project.count();

    if (projectCount === 0) {
      console.log("🌱 Database is empty (0 projects found). Running seed script for first deployment...");
      const seedOutput = execSync("npx tsx prisma/seed.ts", {
        encoding: "utf-8",
        env: process.env,
        stdio: "pipe",
      });
      console.log(sanitizeText(seedOutput));
      console.log("✅ First-time seed executed successfully.");
    } else {
      console.log(`ℹ️ Seed skipped: Database already initialized with ${projectCount} project(s).`);
    }
  } catch (error: any) {
    console.error("⚠️ Error checking or running seed:", sanitizeText(error.message || String(error)));
  } finally {
    await prisma.$disconnect();
  }
}

runDeploy();
