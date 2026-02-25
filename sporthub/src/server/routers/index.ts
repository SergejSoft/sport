import { router } from "../trpc";
import { discoveryRouter } from "./discovery";
import { adminRouter } from "./admin";
import { accountRouter } from "./account";

export const appRouter = router({
  discovery: discoveryRouter,
  admin: adminRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;
