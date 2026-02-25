import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/env";

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}

const globalForPrisma = globalThis as GlobalWithPrisma;

function createPrismaClient(): PrismaClient {
  getDatabaseUrl(); // throws clear error if DATABASE_URL missing (e.g. on Vercel)
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
