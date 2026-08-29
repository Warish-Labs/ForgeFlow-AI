import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reset cached instance if a new model delegate (e.g. watchlist) was added to schema
if (globalForPrisma.prisma && !("watchlist" in globalForPrisma.prisma)) {
  globalForPrisma.prisma = undefined;
}

const getDatabaseUrl = (): string | undefined => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL
  );
};

const activeDbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
