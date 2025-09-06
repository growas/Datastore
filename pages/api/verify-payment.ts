import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reference } = req.query;

  try {
    const response: AxiosResponse<any> = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // Now TypeScript knows response.data exists
    if (response.data.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment not verified' });
    }

    // handle success...
    res.status(200).json({ message: 'Payment verified', data: response.data.data });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error });
  }
}
