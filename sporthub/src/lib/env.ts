/**
 * Required environment variables for SportHub.
 * Use assertServerEnv() where Prisma or Supabase server code runs.
 * Aligned with PROJECT_OVERVIEW.md and .env.example.
 */

const REQUIRED_SERVER = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const ENV_HINT =
  "Set these in .env.local for local dev and in Vercel → Project → Settings → Environment Variables for production.";

export function assertServerEnv(): void {
  const missing = REQUIRED_SERVER.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing required env: ${missing.join(", ")}. ${ENV_HINT}`
    );
  }
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(`DATABASE_URL is not set. ${ENV_HINT}`);
  }
  return url;
}

/**
 * Returns DATABASE_URL with ?pgbouncer=true appended when using a Supabase pooler.
 * Avoids PostgreSQL 42P05 "prepared statement already exists" in serverless.
 */
export function getNormalizedDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (url.includes("pgbouncer=true")) return url;
  const isPooler =
    url.includes("pooler.supabase.com") || url.includes(":6543/");
  if (!isPooler) return url;
  return url.includes("?")
    ? `${url}&pgbouncer=true`
    : `${url}?pgbouncer=true`;
}
