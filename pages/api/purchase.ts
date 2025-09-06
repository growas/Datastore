import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, bundleId, amount } = req.body;

  if (!email || !bundleId || !amount) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Deduct from wallet
    const { data: wallet } = await supabase
      .from('wallet')
      .select('balance')
      .eq('email', email)
      .single();

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const newBalance = wallet.balance - amount;
    await supabase.from('wallet').upsert({ email, balance: newBalance });

    // Insert order
    const refNum = '#a' + Math.floor(10000 + Math.random() * 90000);
    await supabase.from('orders').insert({
      email,
      bundle_id: bundleId,
      amount,
      status: 'processing',
      reference: refNum,
    });

    res.status(200).json({ success: true, newBalance, reference: refNum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Purchase failed' });
  }
}
