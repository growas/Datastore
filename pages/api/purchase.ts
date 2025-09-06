import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, bundleId } = req.body;

  if (!email || !bundleId) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const { data: bundle } = await supabase.from('bundles').select('*').eq('id', bundleId).single();

    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });

    const { data: wallet } = await supabase.from('wallet').select('*').eq('email', email).single();

    if (!wallet || wallet.balance < bundle.price) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const newBalance = wallet.balance - bundle.price;

    await supabase.from('wallet').upsert({ email, balance: newBalance });

    const refNum = `#a${Math.floor(10000 + Math.random() * 90000)}`;
    await supabase.from('orders').insert({
      email,
      bundle_id: bundle.id,
      amount: bundle.price,
      status: 'processing',
      reference: refNum
    });

    return res.status(200).json({ success: true, newBalance, reference: refNum });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
