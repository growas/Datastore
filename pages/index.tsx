import { useState, useEffect } from "react";
import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";

// You can safely replace this with your Supabase client
// import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const [balance, setBalance] = useState<number>(0);
  const [purchases, setPurchases] = useState<any[]>([]);

  // Load wallet and history from localStorage (or fetch from Supabase later)
  useEffect(() => {
    const storedBalance = Number(localStorage.getItem("balance") || 0);
    const storedPurchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    setBalance(storedBalance);
    setPurchases(storedPurchases);
  }, []);

  const updateWalletAndHistory = (network: string, bundleName: string, price: number) => {
    if (balance < price) {
      alert("Insufficient wallet balance. Please deposit funds or use Paystack.");
      return;
    }

    const newPurchase = { network, bundle: bundleName, price, date: new Date().toLocaleString() };
    const updatedPurchases = [...purchases, newPurchase];

    setPurchases(updatedPurchases);
    setBalance(balance - price);

    // Save to localStorage (or to Supabase)
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases));
    localStorage.setItem("balance", (balance - price).toString());
  };

  const handleBundlePurchase = (network: string, bundle: any, recipient: string, email?: string) => {
    if (!recipient) {
      alert("Please enter recipient number.");
      return;
    }

    // ⚡ Paystack live integration
    // Call your Paystack charge API here with bundle.price, email, recipient

    // If user chooses to pay from wallet:
    updateWalletAndHistory(network, bundle.name, bundle.price);
  };

  const handleAfaRegistration = (formData: any) => {
    const price = 8; // GHS 8
    // ⚡ Paystack charge for AFA registration here

    updateWalletAndHistory("AFA", "Membership Registration", price);
  };

  return (
    <div className="space-y-8 p-4">
      <div className="p-2 bg-gray-100 rounded shadow">
        <h2 className="font-bold">Wallet Balance: GHS {balance.toFixed(2)}</h2>
      </div>

      <BundleSelector onSelect={handleBundlePurchase} />
      <AfaRegistration onRegister={handleAfaRegistration} />

      {purchases.length > 0 && (
        <div className="p-2 bg-gray-50 rounded shadow">
          <h2 className="font-bold mb-2">Purchase History</h2>
          <ul>
            {purchases.map((p, i) => (
              <li key={i}>
                {p.date}: {p.network} - {p.bundle} - GHS {p.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
