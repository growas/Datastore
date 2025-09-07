import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";
import { useEffect, useState } from "react";

interface Purchase {
  network: string;
  bundle: string;
  amount: number;
  date: string;
}

export default function Home() {
  const [balance, setBalance] = useState<number>(
    Number(localStorage.getItem("balance") || 0)
  );
  const [purchases, setPurchases] = useState<Purchase[]>(
    JSON.parse(localStorage.getItem("purchases") || "[]")
  );

  const updateDashboard = (network: string, bundleName: string, price: number) => {
    const newPurchase: Purchase = {
      network,
      bundle: bundleName,
      amount: price,
      date: new Date().toLocaleString(),
    };

    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases));

    const newBalance = balance - price;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance.toString());
  };

  useEffect(() => {
    // Initialize balance if not set
    if (!localStorage.getItem("balance")) {
      localStorage.setItem("balance", "0");
    }
  }, []);

  return (
    <div className="space-y-8 p-4">
      {/* Bundle selection */}
      <BundleSelector
        onSelect={(network, bundle, recipient, email) => {
          console.log("Selected bundle:", network, bundle, recipient, email);
          // ⚡ Call your Paystack API with bundle.price here
          updateDashboard(network, bundle.name, bundle.price);
        }}
      />

      {/* AFA Registration */}
      <AfaRegistration
        onRegister={(formData) => {
          console.log("AFA Registration:", formData);
          const price = 8; // AFA membership fee
          // ⚡ Charge GHS 8.00 with Paystack here
          updateDashboard("AFA", "Membership Registration", price);
        }}
      />

      {/* Simple Dashboard */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-bold mb-2">Dashboard</h2>
        <p className="mb-2">Balance: GHS {balance.toFixed(2)}</p>
        <h3 className="font-semibold">Purchase History:</h3>
        {purchases.length === 0 ? (
          <p>No purchases yet.</p>
        ) : (
          <ul className="list-disc pl-5">
            {purchases
              .slice()
              .reverse()
              .map((p, idx) => (
                <li key={idx}>
                  {p.date}: {p.network} - {p.bundle} - GHS {p.amount.toFixed(2)}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
