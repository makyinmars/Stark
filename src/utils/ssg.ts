import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { appRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import type { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "src/server/auth";

export const ssgHelper = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);

  const ctx = createInnerTRPCContext({ session});

  const ssg = createServerSideHelpers({
    ctx,
    router: appRouter,
    transformer: superjson,
  });

  return {
    ssg,
    session,
  };
};
