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
    const errOutput = (error.stdout || "") + "\n" + (error.stderr || "") + "\n" + (error.message || "");
    const sanitizedErrOutput = sanitizeText(errOutput);

    // Detect P3009 error indicating a previously failed migration record in _prisma_migrations
    if (sanitizedErrOutput.includes("P3009") || sanitizedErrOutput.includes("migrate found failed migrations")) {
      console.warn("⚠️ Detected failed migration record in database (P3009). Attempting automatic resolution...");

      // Extract failed migration name from error log if possible, defaulting to migration 2
      const match = sanitizedErrOutput.match(/The `([^`]+)` migration started at/);
      const failedMigration = match ? match[1] : "20260828000000_add_contact_and_pricing_models";

      console.log(`🔧 Marking failed migration '${failedMigration}' as rolled back to allow clean retry...`);

      try {
        const resolveOutput = execSync(`npx prisma migrate resolve --rolled-back "${failedMigration}"`, {
          encoding: "utf-8",
          env: process.env,
          stdio: "pipe",
        });
        console.log(sanitizeText(resolveOutput));
        console.log(`✅ Successfully marked '${failedMigration}' as rolled back.`);

        console.log("🔄 Retrying database migration deployment...");
        const retryOutput = execSync("npx prisma migrate deploy", {
          encoding: "utf-8",
          env: process.env,
          stdio: "pipe",
        });
        console.log(sanitizeText(retryOutput));
        console.log("✅ Database migrations applied successfully on retry.");
      } catch (resolveError: any) {
        console.error("❌ Migration resolution/retry failed!");
        if (resolveError.stdout) console.error("📋 STDOUT:\n" + sanitizeText(resolveError.stdout.toString()));
        if (resolveError.stderr) console.error("🚨 STDERR:\n" + sanitizeText(resolveError.stderr.toString()));
        if (resolveError.message) console.error("💥 Error Message:\n" + sanitizeText(resolveError.message));
        process.exit(1);
      }
    } else {
      console.error("❌ Prisma migration failed!");
      if (error.stdout) console.error("📋 STDOUT:\n" + sanitizeText(error.stdout.toString()));
      if (error.stderr) console.error("🚨 STDERR:\n" + sanitizeText(error.stderr.toString()));
      if (error.message) console.error("💥 Error Message:\n" + sanitizeText(error.message));
      process.exit(1);
    }
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
