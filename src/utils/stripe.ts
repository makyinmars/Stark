import Stripe from "stripe";

import { env } from "src/env.mjs";

/** Figure out a way to get this from the DB without too much wreckage. */

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export default stripe;
