// pages/dashboard.tsx
import { useEffect, useState } from "react";

interface Purchase {
  network: string;
  bundle: string;
  price: string;
  date: string;
}

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch wallet balance
    setBalance(100); // example balance

    // TODO: Replace with actual API call to fetch purchase history
    setPurchases([
      { network: "MTN", bundle: "1GB", price: "5.3", date: "2025-09-07" },
      { network: "TIGO ISHARE", bundle: "2GB", price: "10", date: "2025-09-06" },
    ]);
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Customer Dashboard</h1>
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold">Wallet Balance</h2>
        <p className="text-xl">GHS {balance.toFixed(2)}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded space-y-2">
        <h2 className="text-lg font-semibold">Purchase History</h2>
        {purchases.length === 0 ? (
          <p>No purchases yet.</p>
        ) : (
          <ul className="space-y-1">
            {purchases.map((p, idx) => (
              <li key={idx} className="border-b pb-1">
                <span className="font-semibold">{p.network}</span> - {p.bundle} - GHS {p.price} - {p.date}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
