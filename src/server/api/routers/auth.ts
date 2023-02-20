import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getUserSession: publicProcedure.query(({ ctx }) => {
    if (ctx.session) {
      return ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
    }
  }),
});
