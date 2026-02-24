import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export type Context = {
  userId: string | null;
  // Later: impersonatingUserId, realUserId for admin
};

export function createContext(opts: FetchCreateContextFnOptions): Context {
  return {
    userId: null,
  };
}
