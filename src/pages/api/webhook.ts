import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "src/env.mjs";
import stripe from "src/utils/stripe";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == "POST") {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body as string | Buffer,
        sig as string | Buffer,
        env.STRIPE_WEBHOOK_KEY
      );
      console.log("Event", event);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
    }

    let subscription;
    let status;
    // Handle the event
    /* switch (event?.type) { */
    /*   case "customer.subscription.trial_will_end": */
    /*     subscription = event.data.object; */
    /*     status = subscription.status; */
    /*     console.log(`Subscription status is ${status}.`); */
    /*     // Then define and call a method to handle the subscription trial ending. */
    /*     // handleSubscriptionTrialEnding(subscription); */
    /*     break; */
    /*   case "customer.subscription.deleted": */
    /*     subscription = event.data.object; */
    /*     status = subscription.status; */
    /*     console.log(`Subscription status is ${status}.`); */
    /*     // Then define and call a method to handle the subscription deleted. */
    /*     // handleSubscriptionDeleted(subscriptionDeleted); */
    /*     break; */
    /*   case "customer.subscription.created": */
    /*     subscription = event.data.object; */
    /*     status = subscription.status; */
    /*     console.log(`Subscription status is ${status}.`); */
    /*     // Then define and call a method to handle the subscription created. */
    /*     // handleSubscriptionCreated(subscription); */
    /*     break; */
    /*   case "customer.subscription.updated": */
    /*     subscription = event.data.object; */
    /*     status = subscription.status; */
    /*     console.log(`Subscription status is ${status}.`); */
    /*     // Then define and call a method to handle the subscription update. */
    /*     // handleSubscriptionUpdated(subscription); */
    /*     break; */
    /*   default: */
    /*     // Unexpected event type */
    /*     console.log(`Unhandled event type ${event.type}.`); */
    /* } */

    res.send(status);
  }
}
