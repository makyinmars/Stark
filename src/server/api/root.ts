import { createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { exerciseRouter } from "./routers/exercise";
import { workoutRouter } from "./routers/workout";
import { followRouter } from "./routers/follow";
import { stripeRouter } from "./routers/stripe";
import { featureRequestRouter } from "./routers/feature-request";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  workout: workoutRouter,
  exercise: exerciseRouter,
  follow: followRouter,
  stripe: stripeRouter,
  featureRequest: featureRequestRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
