import { router } from "../trpc";
import { discoveryRouter } from "./discovery";

export const appRouter = router({
  discovery: discoveryRouter,
});

export type AppRouter = typeof appRouter;
