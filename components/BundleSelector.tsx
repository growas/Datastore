import { useState } from "react";

interface Bundle {
  name: string;
  price: number;
}

interface Props {
  onSelect: (network: string, bundle: Bundle, recipient: string, email: string) => void;
}

const bundlesData: Record<string, Bundle[]> = {
  MTN: [
    { name: "1GB", price: 5.3 },
    { name: "2GB", price: 10.5 },
    { name: "3GB", price: 15.4 },
    { name: "4GB", price: 20.3 },
    { name: "5GB", price: 25.2 },
    { name: "6GB", price: 30.1 },
    { name: "7GB", price: 35 },
    { name: "8GB", price: 40 },
    { name: "9GB", price: 45 },
    { name: "10GB", price: 50 },
    { name: "15GB", price: 75 },
    { name: "20GB", price: 100 },
    { name: "25GB", price: 125 },
    { name: "30GB", price: 150 },
  ],
  TIGO_ISHARE: [
    { name: "1GB", price: 5 },
    { name: "2GB", price: 10 },
    { name: "3GB", price: 15 },
    { name: "4GB", price: 20 },
    { name: "5GB", price: 25 },
    { name: "6GB", price: 30 },
    { name: "7GB", price: 35 },
    { name: "8GB", price: 40 },
    { name: "9GB", price: 45 },
    { name: "10GB", price: 50 },
    { name: "15GB", price: 75 },
    { name: "20GB", price: 100 },
    { name: "25GB", price: 125 },
    { name: "30GB", price: 150 },
  ],
  TIGO_BIG_TIME: [
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

const networkColors: Record<string, string> = {
  MTN: "bg-yellow-400",
  TELECEL: "bg-red-500",
  TIGO_ISHARE: "bg-blue-500",
  TIGO_BIG_TIME: "bg-white border border-black",
};

export default function BundleSelector({ onSelect }: Props) {
  const [network, setNetwork] = useState("MTN");
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");

  const handleSelect = (bundle: Bundle) => {
    if (!recipient || !email) {
      alert("Please enter recipient number and email.");
      return;
    }
    onSelect(network, bundle, recipient, email);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {Object.keys(bundlesData).map((net) => (
          <button
            key={net}
            className={`px-4 py-2 rounded font-bold ${
              network === net ? networkColors[net] : "bg-gray-200"
            }`}
            onClick={() => setNetwork(net)}
          >
            {net.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Recipient number"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {bundlesData[network].map((bundle) => (
          <button
            key={bundle.name}
            className={`p-3 rounded font-semibold ${
              networkColors[network] || "bg-gray-200"
            }`}
            onClick={() => handleSelect(bundle)}
          >
            {bundle.name} - GHS {bundle.price}
          </button>
        ))}
      </div>
    </div>
  );
}
