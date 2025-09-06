import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Define the type for Paystack verification response
interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed';
    amount: number;
    reference: string;
    [key: string]: any;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { reference } = req.body;

  try {
    const response = await axios.get<PaystackVerifyResponse>(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    if (response.data.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment not verified' });
    }

    // Do whatever you need with the verified payment here

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
}
