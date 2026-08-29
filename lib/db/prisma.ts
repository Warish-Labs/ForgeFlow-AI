import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reset cached instance if a new model delegate (e.g. watchlist) was added to schema
if (globalForPrisma.prisma && !("watchlist" in globalForPrisma.prisma)) {
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(process.env.DATABASE_URL
      ? { datasources: { db: { url: process.env.DATABASE_URL } } }
      : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
