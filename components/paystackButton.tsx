import { PaystackButton as ReactPaystackButton } from 'react-paystack';

interface PaystackButtonProps {
  email: string;
  amount: number;
  name: string;
  phone: string;
  dob: string;
  onSuccess: (data: any) => void;
}

export default function PaystackButton({ email, amount, name, phone, dob, onSuccess }: PaystackButtonProps) {
  if (!process.env.NEXT_PUBLIC_PAYSTACK_KEY) {
    throw new Error("Paystack public key is not defined in env variables");
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY;

  const componentProps = {
    email,
    amount: amount * 100, // Convert to kobo
    publicKey,
    text: "Pay Now",
    onSuccess: async (ref: any) => {
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: ref.reference, email, amount, name, phone, dob }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess(data);
        } else {
          alert(data.error || 'Verification failed');
        }
      } catch (error) {
        console.error(error);
        alert('Network error. Please try again.');
      }
    },
    onClose: () => {
      alert('Payment canceled');
    },
  };

  return <ReactPaystackButton {...componentProps} />;
    }
