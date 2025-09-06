import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    // add other fields you might use
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reference } = req.query;

  try {
    const response = await axios.get<PaystackVerifyResponse>(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    // TypeScript now knows the structure of response.data
    if (response.data.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment not verified' });
    }

    return res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
