import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, email, dob } = req.body;

  if (!name || !phone || !email || !dob) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await supabase.from('afa').insert({
      name,
      phone,
      email,
      dob,
      fee: 8 // GHS
    });

    return res.status(200).json({ success: true, message: 'AFA Registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
