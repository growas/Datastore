import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY!;

  // Verify Paystack signature
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const email = event.data.customer.email;
    const amount = event.data.amount / 100; // Paystack returns kobo/pesewas

    // Find user by email (you’ll store emails in your wallet table)
    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", email)
      .single();

    if (wallet) {
      const newBalance = wallet.balance + amount;

      await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", email);

      console.log(`Wallet updated: ${email} + GHS ${amount}`);
    }
  }

  return res.status(200).json({ received: true });
}
