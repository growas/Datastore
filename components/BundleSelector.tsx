import { useState } from "react";

const bundles = {
  MTN: [
    { size: "1GB", price: 5.3 },
    { size: "2GB", price: 10.5 },
    { size: "3GB", price: 15.4 },
    { size: "4GB", price: 20.3 },
    { size: "5GB", price: 25.2 },
    { size: "30GB", price: 150.0 },
  ],
  TELECEL: [
    { size: "5GB", price: 24.5 },
    { size: "10GB", price: 45.0 },
    { size: "15GB", price: 60.0 },
    { size: "20GB", price: 80.0 },
    { size: "25GB", price: 100.0 },
    { size: "30GB", price: 111.0 },
  ],
  TIGO_ISHARE: [
    { size: "1GB", price: 5 },
    { size: "2GB", price: 10 },
    { size: "3GB", price: 15 },
    { size: "4GB", price: 20 },
    { size: "5GB", price: 25 },
    { size: "30GB", price: 150 },
  ],
  TIGO_BIGTIME: [
    { size: "15GB", price: 57 },
    { size: "20GB", price: 71 },
    { size: "25GB", price: 76 },
    { size: "30GB", price: 80 },
    { size: "40GB", price: 90 },
    { size: "50GB", price: 100 },
    { size: "100GB", price: 210 },
  ],
};

export default function BundleSelector({
  onSelect,
}: {
  onSelect: (network: string, bundle: any) => void;
}) {
  const [network, setNetwork] = useState<keyof typeof bundles | "">("");
  const [bundle, setBundle] = useState<any>(null);

  const colors: Record<string, string> = {
    MTN: "bg-yellow-500",
    TELECEL: "bg-red-600 text-white",
    TIGO_ISHARE: "bg-blue-600 text-white",
    TIGO_BIGTIME: "bg-blue-800 text-white",
  };

  return (
    <div className="space-y-4 p-4 shadow rounded bg-white">
      <h2 className="text-lg font-bold">Choose Data Bundle</h2>

      <select
        value={network}
        onChange={(e) => {
          setNetwork(e.target.value as keyof typeof bundles);
          setBundle(null);
        }}
        className="w-full p-2 border rounded"
      >
        <option value="">-- Select Network --</option>
        {Object.keys(bundles).map((net) => (
          <option key={net} value={net}>
            {net.replace("_", " ")}
          </option>
        ))}
      </select>

      {network && (
        <select
          value={bundle ? bundle.size : ""}
          onChange={(e) =>
            setBundle(
              bundles[network].find((b) => b.size === e.target.value) || null
            )
          }
          className={`w-full p-2 border rounded ${
            colors[network] || "bg-gray-100"
          }`}
        >
          <option value="">-- Select Bundle --</option>
          {bundles[network].map((b, i) => (
            <option key={i} value={b.size}>
              {b.size} - GHS {b.price}
            </option>
          ))}
        </select>
      )}

      {bundle && (
        <button
          onClick={() => onSelect(network, bundle)}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Buy {bundle.size} ({network}) - GHS {bundle.price}
        </button>
      )}
    </div>
  );
}
