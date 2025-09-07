import { useState } from "react";

interface Bundle {
  name: string;
  price: number;
}

interface BundleSelectorProps {
  onSelect: (
    network: string,
    bundle: Bundle,
    recipient: string,
    email?: string
  ) => void;
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

export default function BundleSelector({ onSelect }: BundleSelectorProps) {
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("MTN");

  const bundles = bundlesData[selectedNetwork];

  return (
    <div className="space-y-4">
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
        required
      />
      <input
        type="email"
        placeholder="Email (for receipt)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* Bundle buttons */}
      <div className="grid grid-cols-3 gap-2">
        {bundles.map((bundle, idx) => (
          <button
            key={idx}
            className={`p-2 rounded font-medium text-center ${
              networkColors[selectedNetwork] || "bg-gray-300"
            }`}
            onClick={() =>
              onSelect(selectedNetwork, bundle, recipient, email || undefined)
            }
          >
            {bundle.name} - GHS {bundle.price.toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  );
}
