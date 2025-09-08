import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function AfaRegistration({
  onRegister,
  onWalletPay,
  walletBalance,
}: {
  onRegister: (data: {
    fullName: string;
    phone: string;
    location: string;
    dob: string;
    email?: string;
  }) => Promise<void>;
  onWalletPay: (amount: number) => Promise<void>;
  walletBalance?: number;
}) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    location: "",
    dob: "",
    email: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">("paystack");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const amount = 8; // GHS 8.00

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (paymentMethod === "wallet") {
      if (walletBalance !== undefined && walletBalance < amount) {
        throw new Error("Insufficient wallet balance");
      }
      await onWalletPay(amount);
      return;
    }

    if (!form.email || !/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email)) {
      throw new Error("A valid email is required for Paystack payment");
    }

    return new Promise<void>((resolve, reject) => {
      if (!window.PaystackPop) {
        reject(new Error("Paystack is not loaded"));
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: form.email,
        amount: amount * 100,
        currency: "GHS",
        ref: "" + Math.floor(Math.random() * 1000000000 + 1),
        onClose: () => reject(new Error("Payment was cancelled")),
        callback: (response: any) => {
          if (response.status === "success") resolve();
          else reject(new Error("Payment failed"));
        },
      });

      handler.openIframe();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await handlePayment();
    } catch (payErr: any) {
      setError(`Payment error: ${payErr.message || payErr}`);
      setLoading(false);
      return;
    }

    try {
      await onRegister(form);
      setSuccess("Registration successful!");
      setForm({
        fullName: "",
        phone: "",
        location: "",
        dob: "",
        email: "",
      });
      setPaymentMethod("paystack");
    } catch (regErr) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg shadow bg-gray-50 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
        <UserIcon className="w-6 h-6 text-blue-600" />
        AFA Registration
      </h2>
      {success && <div className="p-2 rounded bg-green-100 text-green-800">{success}</div>}
      {error && <div className="p-2 rounded bg-red-100 text-red-800">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="email" name="email" placeholder="Email (for receipt)" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" />
        <div className="flex gap-4 items-center">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="paystack"
              checked={paymentMethod === "paystack"}
              onChange={() => setPaymentMethod("paystack")}
              className="mr-1"
            />
            Paystack
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="wallet"
              checked={paymentMethod === "wallet"}
              onChange={() => setPaymentMethod("wallet")}
              className="mr-1"
            />
            Wallet {walletBalance !== undefined && (
              <span className="ml-1 text-xs text-gray-500">(Balance: GHS {walletBalance.toFixed(2)})</span>
            )}
          </label>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700" disabled={loading}>
          {loading ? "Processing..." : `Register (GHS ${amount.toFixed(2)})`}
        </button>
      </form>
    </div>
  );
    }
