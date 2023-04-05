import { env } from "src/env.mjs";
import { getOrCreateStripeCustomerIdForUser } from "src/server/stripe/stripe-webhook-handlers";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      stripe,
      prisma,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req?.headers.host ?? "localhost:3000"}`
        : `https://${req?.headers.host ?? env.NEXTAUTH_URL}`;

    const prices = await stripe.prices.list({
      lookup_keys: ["stark-premiun"],
      expand: ["data.product"],
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: session.user?.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: prices?.data[0]?.id,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/upgrade?checkoutSuccess=true`,
      cancel_url: `${baseUrl}/upgrade?checkoutCanceled=true`,
      subscription_data: {
        metadata: {
          userId: session.user?.id,
        },
      },
    });

    if (!checkoutSession) {
      throw new Error("Could not create checkout session");
    }

    return { checkoutUrl: checkoutSession.url };
  }),
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req?.headers.host ?? "localhost:3000"}`
        : `https://${req?.headers.host ?? env.NEXTAUTH_URL}`;

    const stripeBillingPortalSession =
      await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/upgrade`,
      });

    if (!stripeBillingPortalSession) {
      throw new Error("Could not create billing portal session");
    }

    return { billingPortalUrl: stripeBillingPortalSession.url };
  }),
});
