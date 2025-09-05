import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, bundleId } = req.body;

  try {
    const { data: bundle } = await supabase.from('bundles').select('*').eq('id', bundleId).single();
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });

    const { data: wallet } = await supabase.from('wallet').select('*').eq('email', email).single();
    if (!wallet || wallet.balance < bundle.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const newBalance = wallet.balance - bundle.price;
    await supabase.from('wallet').update({ balance: newBalance }).eq('email', email);

    await supabase.from('orders').insert({
      email,
      bundle_id: bundle.id,
      amount: bundle.price,
      status: 'processing',
      reference: '#a' + Math.floor(10000 + Math.random() * 90000)
    });

    res.status(200).json({ success: true, newBalance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
