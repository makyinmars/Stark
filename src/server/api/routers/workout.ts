import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getTimeOfDay } from "src/utils/date";

const workoutsByUserId = Prisma.validator<Prisma.WorkoutSelect>()({
  id: true,
  name: true,
  copyCount: true,
  exercises: {
    take: 2,
    select: {
      name: true,
    },
  },
  createdAt: true,
});

const getWorkoutById = Prisma.validator<Prisma.WorkoutSelect>()({
  id: true,
  name: true,
  description: true,
  copyCount: true,
  notes: true,
  exercises: true,
  userId: true,
});

const quickWorkoutId = Prisma.validator<Prisma.WorkoutSelect>()({
  id: true,
});

export const workoutRouter = createTRPCRouter({
  getWorkoutById: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUnique({
        where: {
          id: input.workoutId,
        },
        select: getWorkoutById,
      });

      if (!workout) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not find workout",
        });
      }

      return workout;
    }),

  copyWorkoutById: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workoutsCopied = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          workoutsCopied: true,
        },
      });

      const workout = await ctx.prisma.workout.findUnique({
        where: {
          id: input.workoutId,
        },
        include: {
          exercises: {
            include: {
              set: true,
            },
          },
        },
      });

      if (workoutsCopied && workout) {
        // Check if user has copied this workout before
        const workoutAlreadyCopied = workoutsCopied.workoutsCopied.includes(
          workout.id
        );

        if (workoutAlreadyCopied) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already copied this workout",
          });
        }
      }

      if (workout) {
        const newWorkout = await ctx.prisma.workout.create({
          data: {
            name: `${workout.name} - Copy`,
            copyId: workout.id,
            description: workout.description,
            notes: workout.notes,
            userId: input.userId,
          },
        });

        if (newWorkout) {
          // Update the copy count of the workout
          await ctx.prisma.workout.update({
            where: {
              id: workout.id,
            },
            data: {
              copyCount: workout.copyCount + 1,
            },
          });

          await ctx.prisma.user.update({
            where: {
              id: input.userId,
            },
            data: {
              workoutsCopied: workoutsCopied
                ? [...workoutsCopied.workoutsCopied, input.workoutId]
                : [input.workoutId],
            },
            select: {
              workoutsCopied: true,
            },
          });

          for (const exercise of workout.exercises) {
            const newExercise = await ctx.prisma.exercise.create({
              data: {
                name: exercise.name,
                instructions: exercise.instructions,
                type: exercise.type,
                muscle: exercise.muscle,
                equipment: exercise.equipment,
                equipmentNeeded: exercise.equipmentNeeded,
                difficulty: exercise.difficulty,
                time: exercise.time,
                image: exercise.image,
                workoutId: newWorkout.id,
              },
              select: {
                id: true,
              },
            });

            if (!newExercise) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Could not create exercise",
              });
            }

            if (newExercise) {
              for (const set of exercise.set) {
                const newSet = await ctx.prisma.set.create({
                  data: {
                    reps: set.reps,
                    weight: set.weight,
                    time: set.time,
                    rest: set.rest,
                    exerciseId: newExercise.id,
                  },
                });

                if (!newSet) {
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Could not create set",
                  });
                }
              }
            }
            if (!newExercise) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Could not create exercise",
              });
            }
          }

          return newWorkout;
        }
      }
    }),

  createQuickWorkout: protectedProcedure
    .input(
      z.object({
        name: z.string().default(`${getTimeOfDay()} Workout`),
        description: z.string().nullable().default(null),
        copyCount: z.number().default(0),
        notes: z.string().nullable().default(null),
        userId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newQuickWorkout = await ctx.prisma.workout.create({
        data: {
          name: input.name,
          description: input.description,
          copyCount: input.copyCount,
          notes: input.notes,
          userId: input.userId,
        },
      });

      return newQuickWorkout;
    }),

  updateQuickWorkout: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
        name: z.string().default(`${getTimeOfDay()} Workout`),
        description: z.string().nullable().default(null),
        copyCount: z.number().default(0),
        notes: z.string().nullable().default(null),
        userId: z.string(),
        exercises: z.array(
          z.object({
            name: z.string(),
            instructions: z.string(),
            type: z.string(),
            muscle: z.string(),
            equipment: z.string(),
            equipmentNeeded: z.boolean(),
            difficulty: z.string(),
            time: z.number().nullable().default(null),
            image: z.string().nullable().default(null),
            sets: z.array(
              z.object({
                reps: z.number().nullable().default(10),
                weight: z.number().nullable().default(20),
                time: z.number().nullable().default(null),
                rest: z.number().nullable().default(null),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateWorkout = await ctx.prisma.workout.update({
        where: {
          id: input.workoutId,
        },
        data: {
          name: input.name,
          description: input.description,
          copyCount: input.copyCount,
          notes: input.notes,
          userId: input.userId,
        },
        select: quickWorkoutId,
      });

      if (!updateWorkout) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create workout",
        });
      }

      if (updateWorkout) {
        for (const exercise of input.exercises) {
          const newExercise = await ctx.prisma.exercise.create({
            data: {
              name: exercise.name,
              instructions: exercise.instructions,
              type: exercise.type,
              muscle: exercise.muscle,
              equipment: exercise.equipment,
              equipmentNeeded: exercise.equipmentNeeded,
              difficulty: exercise.difficulty,
              time: exercise.time,
              image: exercise.image,
              workoutId: updateWorkout.id,
            },
            select: {
              id: true,
            },
          });

          if (!newExercise) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not create exercise",
            });
          }

          if (newExercise) {
            for (const set of exercise.sets) {
              const newSet = await ctx.prisma.set.create({
                data: {
                  reps: set.reps,
                  weight: set.weight,
                  time: set.time,
                  rest: set.rest,
                  exerciseId: newExercise.id,
                },
              });

              if (!newSet) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Could not create set",
                });
              }
            }
          }
          if (!newExercise) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not create exercise",
            });
          }
        }
      }

      return updateWorkout;
    }),

  deleteWorkoutById: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.workoutId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not delete workout",
        });
      }

      const deletedWorkout = await ctx.prisma.workout.delete({
        where: {
          id: input.workoutId,
        },
      });

      if (deletedWorkout && deletedWorkout.copyId) {
        const workouts = await ctx.prisma.user.findUnique({
          where: {
            id: deletedWorkout.userId as string,
          },
          select: {
            workoutsCopied: true,
          },
        });

        if (workouts) {
          await ctx.prisma.user.update({
            where: {
              id: deletedWorkout.userId as string,
            },
            data: {
              workoutsCopied: workouts.workoutsCopied.filter(
                (w) => w !== deletedWorkout.copyId
              ),
            },
          });
        }
      }

      return deletedWorkout;
    }),

  getWorkoutsByUserId: protectedProcedure
    .input(z.object({ userId: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      if (input.userId) {
        const userWorkouts = await ctx.prisma.workout.findMany({
          take: 4,
          orderBy: {
            createdAt: "desc",
          },
          where: {
            userId: input.userId,
          },
          select: workoutsByUserId,
        });

        if (userWorkouts) {
          return userWorkouts;
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workouts found",
        });
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No user id provided",
      });
    }),
});
