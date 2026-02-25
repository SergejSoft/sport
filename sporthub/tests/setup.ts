/**
 * Load .env.local so foundation tests (DB, Auth) run with the same env as the app.
 * If .env.local is missing or incomplete, tests that require env will fail — that's intentional (env drift detection).
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
