import { router } from "../trpc";
import { discoveryRouter } from "./discovery";
import { adminRouter } from "./admin";
import { accountRouter } from "./account";
import { organiserApplicationRouter } from "./organiser-application";
import { organiserRouter } from "./organiser";

export const appRouter = router({
  discovery: discoveryRouter,
  admin: adminRouter,
  account: accountRouter,
  organiserApplication: organiserApplicationRouter,
  organiser: organiserRouter,
});

export type AppRouter = typeof appRouter;
