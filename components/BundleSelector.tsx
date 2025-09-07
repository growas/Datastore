import { useState } from "react";

interface Bundle {
  gb: number;
  price: number;
}

interface NetworkBundles {
  network: string;
  color: string;
  bundles: Bundle[];
}

const NETWORKS: NetworkBundles[] = [
  {
    network: "MTN",
    color: "yellow",
    bundles: Array.from({ length: 30 }, (_, i) => ({
      gb: i + 1,
      price: parseFloat(((i + 1) * 5.3).toFixed(2)),
    })),
  },
  {
    network: "TIGO ISHARE",
    color: "blue",
    bundles: Array.from({ length: 30 }, (_, i) => ({
      gb: i + 1,
      price: Math.round((i + 1) * 5.3),
    })),
  },
  {
    network: "TIGO BIG-TIME",
    color: "white",
    bundles: [
      { gb: 15, price: 57 },
      { gb: 20, price: 71 },
      { gb: 25, price: 76 },
      { gb: 30, price: 80 },
      { gb: 40, price: 90 },
      { gb: 50, price: 100 },
      { gb: 100, price: 210 },
    ],
  },
  {
    network: "TELECEL",
    color: "red",
    bundles: [
      { gb: 5, price: 24.5 },
      { gb: 10, price: 45 },
      { gb: 15, price: 60 },
      { gb: 20, price: 80 },
      { gb: 25, price: 100 },
      { gb: 30, price: 111 },
    ],
  },
];

interface BundleSelectorProps {
  onSelect: (network: string, bundle: Bundle) => void;
}

export default function BundleSelector({ onSelect }: BundleSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkBundles>(
    NETWORKS[0]
  );

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        {NETWORKS.map((net) => (
          <button
            key={net.network}
            style={{
              backgroundColor: net.color,
              color: net.color === "yellow" ? "black" : "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
            }}
            onClick={() => setSelectedNetwork(net)}
          >
            {net.network}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {selectedNetwork.bundles.map((bundle) => (
          <button
            key={bundle.gb}
            style={{
              backgroundColor: selectedNetwork.color,
              color: selectedNetwork.color === "yellow" ? "black" : "white",
              padding: "0.5rem",
              borderRadius: "0.5rem",
            }}
            onClick={() => onSelect(selectedNetwork.network, bundle)}
          >
            {bundle.gb}GB - GHS {bundle.price}
          </button>
        ))}
      </div>
    </div>
  );
}
