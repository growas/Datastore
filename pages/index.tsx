import { useEffect, useState } from "react";
import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [balance, setBalance] = useState<number>(0);
  const [purchases, setPurchases] = useState<any[]>([]);
  const userId = "demo-user"; // ⚡ later replace with real auth user ID

  // Load wallet + purchases from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (wallet) setBalance(wallet.balance);

      // Purchases
      const { data: history } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (history) setPurchases(history);
    };

    fetchData();
  }, []);

  // Update wallet balance in Supabase
  const updateWallet = async (newBalance: number) => {
    await supabase.from("wallets").upsert({ user_id: userId, balance: newBalance });
    setBalance(newBalance);
  };

  // Save purchase in Supabase
  const savePurchase = async (purchase: any) => {
    await supabase.from("purchases").insert([{ user_id: userId, ...purchase }]);
    setPurchases([purchase, ...purchases]);
  };

  // Handle bundle purchases
  const handleBundlePurchase = async (
    network: string,
    bundle: { name: string; price: number },
    method: "wallet" | "paystack",
    recipient: string,
    email?: string
  ) => {
    if (!recipient) {
      alert("Please enter a recipient number.");
      return;
    }

    if (method === "wallet") {
      if (balance < bundle.price) {
        alert("Insufficient wallet balance. Please top-up.");
        return;
      }
      const newPurchase = {
        network,
        bundle: bundle.name,
        amount: bundle.price,
        recipient,
        method: "Wallet",
        date: new Date().toISOString(),
      };
      await updateWallet(balance - bundle.price);
      await savePurchase(newPurchase);
      alert("Bundle purchased with Wallet!");
    } else {
      alert(
        `Redirecting to Paystack for ${bundle.name} - GHS ${bundle.price.toFixed(
          2
        )}`
      );
      // ⚡ Integrate Paystack here
    }
  };

  // Handle wallet top-up
  const handleTopUp = async (amount: number, email?: string) => {
    if (amount <= 0) {
      alert("Enter a valid top-up amount.");
      return;
    }
    alert(`Redirecting to Paystack for wallet top-up GHS ${amount}`);
    // ⚡ After Paystack success:
    await updateWallet(balance + amount);
  };

  // Handle AFA registration
  const handleAfaRegister = async (formData: any) => {
    const price = 8;
    if (balance < price) {
      alert("Insufficient wallet balance. Please top-up.");
      return;
    }
    const newPurchase = {
      network: "AFA",
      bundle: "Membership Registration",
      amount: price,
      method: "Wallet",
      date: new Date().toISOString(),
    };
    await updateWallet(balance - price);
    await savePurchase(newPurchase);
    alert("AFA Registration completed!");
  };

  return (
    <div className="space-y-8 p-4">
      {/* Wallet Balance */}
      <div className="p-4 rounded-lg shadow bg-green-50">
        <h2 className="text-lg font-bold text-green-700">Wallet Balance</h2>
        <p className="text-2xl font-semibold">GHS {balance.toFixed(2)}</p>
      </div>

      {/* Bundle Selector */}
      <BundleSelector onSelect={handleBundlePurchase} onTopUp={handleTopUp} />

      {/* AFA Registration */}
      <AfaRegistration onRegister={handleAfaRegister} />

      {/* Purchase History */}
      <div className="p-4 rounded-lg shadow bg-gray-50">
        <h2 className="text-lg font-bold text-gray-700">Purchase History</h2>
        <ul className="space-y-2">
          {purchases.map((p, idx) => (
            <li key={idx} className="border-b pb-2 text-sm">
              <span className="font-medium">{p.network}</span> — {p.bundle} —{" "}
              GHS {p.amount} — {p.method} —{" "}
              {new Date(p.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
