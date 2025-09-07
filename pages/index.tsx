import { useEffect, useState } from "react";
import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";
import { supabase } from "../lib/supabaseClient";

interface Transaction {
  id: number;
  type: "deposit" | "purchase";
  amount: number;
  description: string;
  created_at: string;
}

export default function Home() {
  const [balance, setBalance] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch wallet balance + transactions
  useEffect(() => {
    const fetchWallet = async () => {
      if (!email) return;

      // Fetch balance
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", email)
        .single();

      if (walletData) setBalance(walletData.balance);

      // Fetch transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", email)
        .order("created_at", { ascending: false });

      if (txData) setTransactions(txData);
    };

    fetchWallet();
  }, [email]);

  // Save a transaction in Supabase
  const logTransaction = async (
    type: "deposit" | "purchase",
    amount: number,
    description: string
  ) => {
    if (!email) return;

    await supabase.from("transactions").insert([
      {
        user_id: email,
        type,
        amount,
        description,
      },
    ]);

    // Refresh transactions
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", email)
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
  };

  // Handle bundle purchase
  const updateDashboard = async (
    network: string,
    bundleName: string,
    price: number,
    method: "wallet" | "paystack",
    buyerEmail?: string
  ) => {
    if (method === "wallet") {
      if (balance < price) {
        alert("Insufficient balance. Please top up your wallet.");
        return;
      }

      const newBalance = balance - price;

      // Update Supabase wallet
      await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", buyerEmail);

      setBalance(newBalance);

      await logTransaction("purchase", price, `${network} - ${bundleName}`);
    } else if (method === "paystack" && buyerEmail) {
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: buyerEmail,
        amount: price * 100,
        currency: "GHS",
        callback: async function (response: any) {
          alert("Payment successful! Ref: " + response.reference);

          // Store purchase (webhook will also update balance)
          await logTransaction("purchase", price, `${network} - ${bundleName}`);
        },
        onClose: function () {
          alert("Payment window closed");
        },
      });

      handler.openIframe();
    }
  };

  // Handle wallet top-up
  const handleTopUp = (amount: number, buyerEmail?: string) => {
    if (!buyerEmail) {
      alert("Please enter your email to top-up.");
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: buyerEmail,
      amount: amount * 100,
      currency: "GHS",
      callback: async function (response: any) {
        alert("Top-up successful! Ref: " + response.reference);

        // Log deposit (webhook should update balance in DB)
        await logTransaction("deposit", amount, "Wallet Top-up");
      },
      onClose: function () {
        alert("Payment window closed");
      },
    });

    handler.openIframe();
  };

  return (
    <div className="space-y-8 p-4">
      {/* Email input */}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* Wallet Balance & Top-up */}
      <div className="p-4 rounded-lg shadow bg-gray-100">
        <h2 className="text-lg font-bold">Wallet Balance: GHS {balance}</h2>
        <div className="flex space-x-2 mt-2">
          <button
            onClick={() => handleTopUp(20, email)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Top-up GHS 20
          </button>
          <button
            onClick={() => handleTopUp(50, email)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Top-up GHS 50
          </button>
        </div>
      </div>

      {/* Bundle Selector */}
      <BundleSelector
        onSelect={(network, bundle, recipient, buyerEmail) => {
          if (!buyerEmail) {
            alert("Please enter your email before purchase.");
            return;
          }

          const method = confirm(
            `Pay with wallet (OK) or Paystack (Cancel)?`
          )
            ? "wallet"
            : "paystack";

          updateDashboard(network, bundle.name, bundle.price, method, buyerEmail);
        }}
      />

      {/* AFA Registration */}
      <AfaRegistration
        onRegister={(formData) => {
          const price = 8;
          const method = confirm(
            "Pay with wallet (OK) or Paystack (Cancel)?"
          )
            ? "wallet"
            : "paystack";

          updateDashboard("AFA", "Membership Registration", price, method, email);
        }}
      />

      {/* Transaction History */}
      <div className="p-4 rounded-lg shadow bg-white">
        <h2 className="text-lg font-bold mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between border-b pb-1 text-sm"
              >
                <span>
                  {tx.type === "deposit" ? "💰" : "📦"} {tx.description}
                </span>
                <span className="font-semibold">
                  GHS {tx.amount}{" "}
                  <span className="text-gray-500 text-xs">
                    ({new Date(tx.created_at).toLocaleString()})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  }
