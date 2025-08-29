import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../../lib/stripe";
import { requireUserId } from "../util/getUserId";
import { getMentorProfile, saveMentorStripeAccount } from "../../../lib/stripe-connect-helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = requireUserId(req, res);
  if (!userId) return;

  // Si ya tiene cuenta, reusa
  let accountId = await getMentorProfile(userId).then(p => p?.stripeAccountId).catch(() => undefined);

  if (!accountId) {
    const acc = await stripe.accounts.create({
      type: "express",
      metadata: { userId },
      capabilities: {
        transfers: { requested: true },
      },
    });
    accountId = acc.id;
    await saveMentorStripeAccount(userId, accountId);
  }

  const link = await stripe.accountLinks.create({
    account: accountId!,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mentoria?connect=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mentoria?connect=return`,
    type: "account_onboarding",
  });

  res.status(200).json({ url: link.url });
}
