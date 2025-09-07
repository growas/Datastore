import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await axios.post("YOUR_PAYMENT_ENDPOINT", req.body);

<<<<<<< HEAD
    // Fix: TypeScript-safe access
    const respData = (response as any)?.data?.data;
    res.status(200).json(respData);
=======
    const respData = (response as any)?.data?.data;
res.status(200).json(respData);
>>>>>>> 7284de8 (Fix TypeScript error in purchase.ts for safe response handling)
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
}
