import { PrismaClient } from "@prisma/client";
import { getNormalizedDatabaseUrl } from "@/lib/env";

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}

const globalForPrisma = globalThis as GlobalWithPrisma;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getNormalizedDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
