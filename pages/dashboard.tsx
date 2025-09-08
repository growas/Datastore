import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

interface Purchase {
  network: string;
  bundle: string;
  amount: number;
  date: string;
}

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Purchase[]>([]);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);

      let cleanup: (() => void) | undefined;
      initRealtime(storedEmail).then((fn) => (cleanup = fn));

      return () => {
        if (cleanup) cleanup();
      };
    }
  }, []);

  // Setup realtime subscriptions for wallet and purchases
  const initRealtime = async (email: string): Promise<() => void> => {
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !user) {
      console.error("Error fetching user:", error);
      return () => {};
    }

    const userId = user.id;

    // Fetch initial wallet balance and purchase history
    fetchAndSetBalance(userId);
    fetchPurchaseHistory(userId);

    // Subscribe to wallet updates
    const walletChannel = supabase
      .channel("wallets-balance")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new.balance === "number") {
            setBalance(payload.new.balance);
          }
        }
      )
      .subscribe();

    // Subscribe to new purchases
    const purchaseChannel = supabase
      .channel("purchases-history")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "purchases",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const newPurchase: Purchase = {
              network: payload.new.network,
              bundle: payload.new.bundle,
              amount: Number(payload.new.amount),
              date: new Date(payload.new.date).toLocaleString(),
            };
            setHistory((prev) => [newPurchase, ...prev]);
          }
        }
      )
      .subscribe();

    // Cleanup function to remove subscriptions
    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(purchaseChannel);
    };
  };

  // Fetch wallet balance once
  const fetchAndSetBalance = async (userId: number) => {
    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching wallet balance:", error);
      return;
    }

    if (wallet && typeof wallet.balance === "number") {
      setBalance(wallet.balance);
    }
  };

  // Fetch purchase history once
  const fetchPurchaseHistory = async (userId: number) => {
    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("network,bundle,amount,date")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching purchase history:", error);
      return;
    }

    if (purchases && Array.isArray(purchases)) {
      const normalizedPurchases: Purchase[] = purchases.map((p) => ({
        network: p.network,
        bundle: p.bundle,
        amount: Number(p.amount),
        date: new Date(p.date).toLocaleString(),
      }));
      setHistory(normalizedPurchases);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-700">My Dashboard</h1>

      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="text-xl font-semibold">Wallet Balance</h2>
        <p className="text-2xl font-bold text-green-600">GHS {balance.toFixed(2)}</p>

        <Link href="/deposit">
          <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Deposit Funds
          </button>
        </Link>
      </div>

      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="text-xl font-semibold">Purchase History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No purchases yet.</p>
        ) : (
          <ul className="divide-y divide-gray-300">
            {history.map((item, index) => (
              <li key={index} className="py-2 flex flex-col md:flex-row md:justify-between">
                <span>
                  {item.network} - {item.bundle}
                </span>
                <span className="font-semibold">GHS {item.amount}</span>
                <span className="text-sm text-gray-500">{item.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
