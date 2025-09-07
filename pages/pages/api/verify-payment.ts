import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { reference, email, amount } = req.body;

  try {
    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    if (response.data.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment not verified' });
    }

    // Update wallet
    const { error } = await supabase
      .from('wallet')
      .upsert({ email, balance: amount }, { onConflict: 'email' });

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
