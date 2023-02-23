import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUserById: protectedProcedure
    .input(z.object({ id: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      if (input.id) {
        return ctx.prisma.user.findUnique({
          where: {
            id: input.id,
          },
        });
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No user id provided",
      });
    }),
});
