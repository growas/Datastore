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
  const { name, phone, email, dob } = req.body;

  if (!name || !phone || !email || !dob) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await supabase.from('afa').insert({ name, phone, email, dob });
    res.status(200).json({ success: true, message: 'AFA Registered!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AFA registration failed' });
  }
}
