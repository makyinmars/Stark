import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { exercises, yogaExercises } from "src/data/exercises";

export const exerciseRouter = createTRPCRouter({
  createExercises: protectedProcedure.mutation(async ({ ctx }) => {
    // Create exercises with the data from src/data/exercises.ts
    // Use ctx.prisma.exercise.createMany to create multiple exercises at once
    for (const exercise of yogaExercises) {
      const newExercise = await ctx.prisma.exercise.createMany({
        data: {
          name: exercise.name,
          instructions: exercise.instructions,
          type: exercise.type,
          muscle: exercise.muscle,
          equipment: exercise.equipment,
          equipmentNeeded: exercise.equipmentNeeded,
          difficulty: exercise.difficulty,
          image: exercise.image,
        },
      });

      if (!newExercise) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create exercise",
        });
      }
      console.log("New exercise created!", newExercise);
    }
  }),
});
