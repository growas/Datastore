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
    // Get user email (you can also manage this with auth later)
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      fetchUserData(storedEmail);
    }
  }, []);

  const fetchUserData = async (email: string) => {
    // Fetch balance from Supabase
    const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
    if (user) setBalance(user.balance);

    // Fetch purchase history (stored locally for now)
    const localPurchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    setHistory(localPurchases);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-700">My Dashboard</h1>

      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="text-xl font-semibold">Balance</h2>
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
              <li key={index} className="py-2 flex justify-between">
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
