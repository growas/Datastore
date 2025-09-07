import React from "react";

type Bundle = {
  name: string;
  price: number;
  color: string;
};

type NetworkBundles = Record<string, Bundle[]>;

const bundles: NetworkBundles = {
  MTN: Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}GB`,
    price: +(5.3 * (i + 1)).toFixed(2),
    color: "yellow",
  })),

  "TIGO ISHARE": Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}GB`,
    price: 5 * (i + 1), // No decimals
    color: "blue",
  })),

  "TIGO BIG-TIME": [
    { name: "15GB", price: 57, color: "white" },
    { name: "20GB", price: 71, color: "white" },
    { name: "25GB", price: 76, color: "white" },
    { name: "30GB", price: 80, color: "white" },
    { name: "40GB", price: 90, color: "white" },
    { name: "50GB", price: 100, color: "white" },
    { name: "100GB", price: 210, color: "white" },
  ],

  TELECEL: [
    { name: "5GB", price: 24.5, color: "red" },
    { name: "10GB", price: 45, color: "red" },
    { name: "15GB", price: 60, color: "red" },
    { name: "20GB", price: 80, color: "red" },
    { name: "25GB", price: 100, color: "red" },
    { name: "30GB", price: 111, color: "red" },
  ],
};

type BundleSelectorProps = {
  onSelect: (network: string, bundle: Bundle) => void;
};

export default function BundleSelector({ onSelect }: BundleSelectorProps) {
  return (
    <div className="space-y-8 p-4">
      {Object.entries(bundles).map(([network, networkBundles]) => (
        <div key={network}>
          <h2 style={{ color: networkBundles[0].color, fontWeight: "bold", fontSize: "1.2rem" }}>
            {network}
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {networkBundles.map((bundle) => (
              <button
                key={bundle.name}
                style={{
                  backgroundColor: bundle.color,
                  color: bundle.color === "yellow" ? "black" : "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
                onClick={() => onSelect(network, bundle)}
              >
                {bundle.name} - GHS {bundle.price}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
                      }
