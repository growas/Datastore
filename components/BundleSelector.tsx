import { useState } from "react";

type Bundle = {
  name: string;
  price: number;
};

type Props = {
  onSelect: (network: string, bundle: Bundle, method: "wallet" | "paystack", recipient: string, email?: string) => void;
};

export default function BundleSelector({ onSelect }: Props) {
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");

  const networks: Record<string, { color: string; bundles: Bundle[] }> = {
    MTN: {
      color: "bg-yellow-300",
      bundles: Array.from({ length: 30 }, (_, i) => ({
        name: `${i + 1}GB`,
        price: Number(((i + 1) * 5.2 + 0.1).toFixed(2)), // Example pricing
      })),
    },
    "TIGO iShare": {
      color: "bg-blue-200",
      bundles: Array.from({ length: 30 }, (_, i) => ({
        name: `${i + 1}GB`,
        price: i + 1 * 5, // No decimals (as requested)
      })),
    },
    "TIGO Big-Time": {
      color: "bg-blue-400",
      bundles: [
        { name: "15GB", price: 57 },
        { name: "20GB", price: 71 },
        { name: "25GB", price: 76 },
        { name: "30GB", price: 80 },
        { name: "40GB", price: 90 },
        { name: "50GB", price: 100 },
        { name: "100GB", price: 210 },
      ],
    },
    TELECEL: {
      color: "bg-red-300",
      bundles: [
        { name: "5GB", price: 24.5 },
        { name: "10GB", price: 45 },
        { name: "15GB", price: 60 },
        { name: "20GB", price: 80 },
        { name: "25GB", price: 100 },
        { name: "30GB", price: 111 },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Buy Data Bundles</h2>

      <div className="space-y-2">
        <input
          type="tel"
          placeholder="Recipient Phone Number"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Your Email (for Paystack)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {Object.entries(networks).map(([network, { color, bundles }]) => (
        <div key={network} className={`p-4 rounded-lg shadow ${color}`}>
          <h3 className="text-lg font-bold mb-2">{network}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {bundles.map((bundle) => (
              <div key={bundle.name} className="p-2 border rounded bg-white space-y-2">
                <p className="font-semibold">{bundle.name}</p>
                <p className="text-sm text-gray-600">GHS {bundle.price}</p>

                <button
                  onClick={() =>
                    onSelect(network, bundle, "wallet", recipient)
                  }
                  className="w-full bg-green-600 text-white p-1 rounded text-sm hover:bg-green-700"
                  disabled={!recipient}
                >
                  Buy with Wallet
                </button>

                <button
                  onClick={() =>
                    onSelect(network, bundle, "paystack", recipient, email)
                  }
                  className="w-full bg-blue-600 text-white p-1 rounded text-sm hover:bg-blue-700"
                  disabled={!recipient || !email}
                >
                  Buy with Paystack
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
