import { useState } from "react";

interface Bundle {
  name: string;
  price: number;
}

interface BundleSelectorProps {
  onSelect: (
    network: string,
    bundle: Bundle,
    method: "wallet" | "paystack",
    recipient: string,
    email?: string
  ) => void;
  onTopUp: (amount: number, email?: string) => void;
}

const networkColors: Record<string, string> = {
  MTN: "bg-yellow-400",
  TELECEL: "bg-red-500",
  "TIGO BIG-TIME": "bg-blue-500 text-white",
  "TIGO ISHARE": "bg-blue-200",
  AFA: "bg-green-300",
};

const bundlesData: Record<string, Bundle[]> = {
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

export default function BundleSelector({ onSelect, onTopUp }: BundleSelectorProps) {
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState("MTN");

  const bundles = bundlesData[selectedNetwork];

  return (
    <div className="space-y-6">
      {/* Wallet Top-up */}
      <div className="p-4 border rounded bg-gray-50 space-y-2">
        <h2 className="font-semibold text-green-700">💰 Wallet Top-up</h2>
        <input
          type="number"
          placeholder="Enter amount (GHS)"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(Number(e.target.value))}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={() => onTopUp(topUpAmount, email)}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Top-up via Paystack
        </button>
      </div>

      {/* Network selection */}
      <div className="flex space-x-2">
        {Object.keys(bundlesData).map((network) => (
          <button
            key={network}
            className={`px-3 py-1 rounded font-semibold ${
              networkColors[network] || "bg-gray-300"
            } ${selectedNetwork === network ? "ring-2 ring-black" : ""}`}
            onClick={() => setSelectedNetwork(network)}
          >
            {network}
          </button>
        ))}
      </div>

      {/* Recipient and email input */}
      <input
        type="text"
        placeholder="Recipient number"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="email"
        placeholder="Email (for payment receipt)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* Bundle buttons */}
      <div className="grid grid-cols-3 gap-2">
        {bundles.map((bundle, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center border rounded p-2 space-y-2"
          >
            <span className="font-medium">
              {bundle.name} - GHS {bundle.price.toFixed(2)}
            </span>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() =>
                  onSelect(selectedNetwork, bundle, "wallet", recipient, email)
                }
              >
                Wallet
              </button>
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() =>
                  onSelect(selectedNetwork, bundle, "paystack", recipient, email)
                }
              >
                Paystack
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
