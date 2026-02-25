import { router } from "../trpc";
import { discoveryRouter } from "./discovery";
import { adminRouter } from "./admin";

export const appRouter = router({
  discovery: discoveryRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
