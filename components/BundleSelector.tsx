import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

type Network = "MTN" | "TELECEL" | "TIGO BIG-TIME" | "TIGO ISHARE";

interface Bundle {
  name: string;
  price: number;
}

interface CombinedRegistrationProps {
  onRegister: (data: {
    fullName: string;
    phone: string;
    location: string;
    dob: string;
    email?: string;
  }) => Promise<void>;
  onWalletPay: (amount: number) => Promise<void>;
  walletBalance?: number;
}

const networkColors: Record<Network, string> = {
  MTN: "bg-yellow-400 text-black",
  TELECEL: "bg-red-500 text-white",
  "TIGO BIG-TIME": "bg-blue-600 text-white",
  "TIGO ISHARE": "bg-blue-600 text-white",
};

const bundlesData: Record<Network, Bundle[]> = {
  MTN: Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}GB`,
    price: parseFloat(((i + 1) * 5.3).toFixed(2)),
  })),
  "TIGO ISHARE": Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}GB`,
    price: (i + 1) * 5,
  })),
  "TIGO BIG-TIME": [
    { name: "15GB", price: 57 },
    { name: "20GB", price: 71 },
    { name: "25GB", price: 76 },
    { name: "30GB", price: 80 },
    { name: "40GB", price: 90 },
    { name: "50GB", price: 100 },
    { name: "100GB", price: 210 },
  ],
  TELECEL: [
    { name: "5GB", price: 24.5 },
    { name: "10GB", price: 45 },
    { name: "15GB", price: 60 },
    { name: "20GB", price: 80 },
    { name: "25GB", price: 100 },
    { name: "30GB", price: 111 },
  ],
};

export default function CombinedRegistration({
  onRegister,
  onWalletPay,
  walletBalance,
}: CombinedRegistrationProps) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    location: "",
    dob: "",
    email: "",
  });
  const [selectedNetwork, setSelectedNetwork] = useState<Network>("MTN");
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">("paystack");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const bundles = bundlesData[selectedNetwork];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Validation ---
  const isPhoneValid = (phone: string) => /^[0-9]{9,15}$/.test(phone);
  const isEmailValid = (email: string) => (email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : true);
  const isFormValid = () =>
    form.fullName &&
    form.phone &&
    form.location &&
    form.dob &&
    isPhoneValid(form.phone) &&
    isEmailValid(form.email) &&
    selectedBundle;

  // --- Payment Handling ---
  const handlePayment = () => {
    if (!selectedBundle) return Promise.reject("Select a bundle first");
    const amount = selectedBundle.price;

    if (paymentMethod === "wallet") {
      if (walletBalance !== undefined && walletBalance < amount)
        return Promise.reject("Insufficient wallet balance");
      return onWalletPay(amount);
    }

    return new Promise<void>((resolve, reject) => {
      if (!window.PaystackPop) {
        reject("Paystack is not loaded");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY, // use env variable
        email: form.email || "no-email@example.com",
        amount: amount * 100,
        currency: "GHS",
        ref: "" + Math.floor(Math.random() * 1000000000 + 1),
        onClose: () => reject("Payment cancelled"),
        callback: async (response: any) => {
          // Here you should verify payment on server
          try {
            // await fetch("/api/verify-payment", { method: "POST", body: JSON.stringify({ reference: response.reference }) });
            resolve();
          } catch {
            reject("Payment verification failed");
          }
        },
      });

      handler.openIframe();
    });
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await handlePayment();
      await onRegister(form);
      setSuccess("Registration and bundle purchase successful!");
      setForm({ fullName: "", phone: "", location: "", dob: "", email: "" });
      setSelectedBundle(null);
      setSelectedNetwork("MTN"); // reset to default
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg shadow bg-gray-50 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
        <UserIcon className="w-6 h-6 text-blue-600" />
        AFA Registration & Bundle Purchase
      </h2>

      {success && <div className="p-2 rounded bg-green-100 text-green-800">{success}</div>}
      {error && <div className="p-2 rounded bg-red-100 text-red-800">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="w-full p-2 border rounded" required aria-label="Full Name" />
        <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" required aria-label="Phone Number" />
        <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" required aria-label="Location" />
        <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full p-2 border rounded" required aria-label="Date of Birth" />
        <input type="email" name="email" placeholder="Email (for receipt)" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" aria-label="Email" />

        {/* Network Selector */}
        <div className="flex space-x-2">
          {Object.keys(bundlesData).map((network) => (
            <button
              type="button"
              key={network}
              className={`px-3 py-1 rounded font-semibold transition-all duration-150 ${networkColors[network as Network] || "bg-gray-300 text-black"} ${selectedNetwork === network ? "ring-2 ring-black" : ""}`}
              onClick={() => setSelectedNetwork(network as Network)}
              aria-label={`Select ${network}`}
            >
              {network}
            </button>
          ))}
        </div>

        {/* Bundle Selector */}
        <div className="grid grid-cols-3 gap-2">
          {bundles.map((bundle) => (
            <button
              type="button"
              key={bundle.name}
              className={`p-2 rounded font-medium text-center transition-all duration-150 ${networkColors[selectedNetwork] || "bg-gray-300 text-black"} ${selectedBundle?.name === bundle.name ? "ring-2 ring-black" : ""}`}
              onClick={() => setSelectedBundle(bundle)}
              aria-label={`Select bundle ${bundle.name}`}
            >
              {bundle.name} - GHS {bundle.price.toFixed(2)}
            </button>
          ))}
        </div>

        {/* Payment Method */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center">
            <input type="radio" name="paymentMethod" value="paystack" checked={paymentMethod === "paystack"} onChange={() => setPaymentMethod("paystack")} className="mr-1" />
            Paystack
          </label>
          <label className="flex items-center">
            <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")} className="mr-1" />
            Wallet {walletBalance !== undefined && <span className="ml-1 text-xs text-gray-500">(Balance: GHS {walletBalance.toFixed(2)})</span>}
          </label>
        </div>

        <button type="submit" disabled={!isFormValid() || loading} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          {loading ? "Processing..." : selectedBundle ? `Pay GHS ${selectedBundle.price.toFixed(2)}` : "Select a bundle"}
        </button>
      </form>
    </div>
  );
}
