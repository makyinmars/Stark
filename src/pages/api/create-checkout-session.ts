import type { NextApiRequest, NextApiResponse } from "next";
import stripe from "src/utils/stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const prices = await stripe.prices.list({
      lookup_keys: ["stark-premiun"],
      expand: ["data.product"],
    });

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: prices?.data[0]?.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url:
        "http://localhost:3000/success=true&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel=true",
    });

    res.redirect(303, session.url as string);
  }
}
