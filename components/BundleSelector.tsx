import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Bundle = {
  name: string;
  price: number;
};

type NetworkBundles = {
  [key: string]: Bundle[];
};

const bundles: NetworkBundles = {
  MTN: Array.from({ length: 30 }, (_, i) => {
    const gb = i + 1;
    return { name: `${gb}GB`, price: parseFloat((gb * 5.2 + 0.1).toFixed(2)) };
  }),

  "TIGO iShare": Array.from({ length: 30 }, (_, i) => {
    const gb = i + 1;
    return { name: `${gb}GB`, price: Math.floor(gb * 5.2 + 0.1) }; // No decimals
  }),

  "TIGO Big-Time": [
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

const networkColors: { [key: string]: string } = {
  MTN: "bg-yellow-400 text-black",
  "TIGO iShare": "bg-blue-600 text-white",
  "TIGO Big-Time": "bg-blue-600 text-white",
  TELECEL: "bg-red-600 text-white",
};

export default function BundleSelector({
  onSelect,
}: {
  onSelect: (network: string, bundle: Bundle) => void;
}) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

  const handlePurchase = async (network: string, bundle: Bundle) => {
    const email = prompt("Enter your email to confirm purchase:");
    if (!email) return;

    // Fetch user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      alert("User not found. Please deposit first.");
      return;
    }

    if (user.balance < bundle.price) {
      alert("Insufficient balance. Please deposit more.");
      return;
    }

    // Deduct balance
    await supabase
      .from("users")
      .update({ balance: user.balance - bundle.price })
      .eq("id", user.id);

    // Record purchase
    await supabase.from("purchases").insert({
      user_id: user.id,
      network,
      bundle: bundle.name,
      amount: bundle.price,
    });

    alert(`Purchase successful: ${bundle.name} (${network}) for GHS ${bundle.price}`);
    onSelect(network, bundle);
  };

  return (
    <div className="p-4 rounded-lg shadow bg-gray-50 space-y-4">
      <h2 className="text-xl font-bold">Select Data Bundle</h2>

      {/* Network Buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(bundles).map((network) => (
          <button
            key={network}
            onClick={() => setSelectedNetwork(network)}
            className={`px-4 py-2 rounded ${networkColors[network]}`}
          >
            {network}
          </button>
        ))}
      </div>

      {/* Bundles for selected network */}
      {selectedNetwork && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {bundles[selectedNetwork].map((bundle) => (
            <button
              key={bundle.name}
              onClick={() => handlePurchase(selectedNetwork, bundle)}
              className="p-3 border rounded hover:shadow-lg"
            >
              <p className="font-semibold">{bundle.name}</p>
              <p className="text-gray-600">GHS {bundle.price}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
