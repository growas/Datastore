import { useState, useEffect } from "react";
import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";
import { supabase } from "../utils/supabaseClient";

// Define TypeScript interfaces for bundle and purchase
interface Bundle {
  name: string;
  price: number;
  [key: string]: any;
}

interface Purchase {
  id: string;
  network: string;
  bundle: string;
  price: number;
  date: string;
  user_id: string;
}

// Util to generate a unique id for new local objects before insertion
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Replace this with your actual user authentication logic
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export default function Home() {
  const [balance, setBalance] = useState<number>(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load wallet and history from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const uid = await getCurrentUserId();
      setUserId(uid);

      if (!uid) {
        alert("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", uid)
        .single();

      if (walletError && walletError.code !== "PGRST116") {
        alert("Error fetching wallet: " + walletError.message);
        setLoading(false);
        return;
      }

      setBalance(wallet?.balance ?? 0);

      // Fetch purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", uid)
        .order("date", { ascending: false });

      if (purchaseError) {
        alert("Error fetching purchases: " + purchaseError.message);
        setPurchases([]);
      } else {
        setPurchases(purchaseData ?? []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Deposit funds into wallet
  const handleDeposit = async () => {
    if (!userId) return;
    const amountStr = prompt("Enter the amount to deposit (GHS):");
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid deposit amount.");
      return;
    }
    setLoading(true);
    // Upsert wallet balance
    const { data, error } = await supabase.rpc("increment_wallet_balance", {
      user_id_input: userId,
      amount_input: amount,
    });
    if (error) {
      alert("Error depositing funds: " + error.message);
    } else {
      setBalance((prev) => prev + amount);
    }
    setLoading(false);
  };

  // Update wallet and purchases in Supabase
  const updateWalletAndHistory = async (
    network: string,
    bundleName: string,
    price: number
  ) => {
    if (!userId) return;
    if (balance < price) {
      alert("Insufficient wallet balance. Please deposit funds or use Paystack.");
      return;
    }
    setLoading(true);

    // Atomically update wallet balance
    const { data: wallet, error: walletError } = await supabase.rpc(
      "decrement_wallet_balance",
      {
        user_id_input: userId,
        amount_input: price,
      }
    );
    if (walletError) {
      alert("Error updating wallet: " + walletError.message);
      setLoading(false);
      return;
    }

    // Insert purchase record
    const purchase: Omit<Purchase, "id"> = {
      network,
      bundle: bundleName,
      price,
      date: new Date().toISOString(),
      user_id: userId,
    };
    const { data: newPurchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert([purchase])
      .select()
      .single();

    if (purchaseError) {
      alert("Error recording purchase: " + purchaseError.message);
      setLoading(false);
      return;
    }

    setBalance((prev) => prev - price);
    setPurchases((prev) => [newPurchase, ...prev]);
    setLoading(false);
  };

  const handleBundlePurchase = async (
    network: string,
    bundle: Bundle,
    recipient: string,
    email?: string
  ) => {
    if (!recipient) {
      alert("Please enter recipient number.");
      return;
    }
    setLoading(true);
    try {
      // ⚡ TODO: Integrate Paystack here if needed
      // If user chooses to pay from wallet:
      await updateWalletAndHistory(network, bundle.name, bundle.price);
      // Optionally, show confirmation here
    } catch (error) {
      alert("An error occurred during purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAfaRegistration = async (_formData: any) => {
    const price = 8; // GHS 8
    setLoading(true);
    try {
      // ⚡ TODO: Integrate Paystack charge for AFA registration here if needed
      await updateWalletAndHistory("AFA", "Membership Registration", price);
      // Optionally, show confirmation here
    } catch (error) {
      alert("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div className="p-2 bg-gray-100 rounded shadow flex items-center justify-between">
        <h2 className="font-bold">Wallet Balance: GHS {balance.toFixed(2)}</h2>
        <button
          className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleDeposit}
          disabled={loading}
        >
          Deposit Funds
        </button>
      </div>

      <BundleSelector onSelect={handleBundlePurchase} disabled={loading} />
      <AfaRegistration onRegister={handleAfaRegistration} disabled={loading} />

      {loading && (
        <div className="text-blue-600 font-semibold">Processing...</div>
      )}

      {purchases.length > 0 && (
        <div className="p-2 bg-gray-50 rounded shadow">
          <h2 className="font-bold mb-2">Purchase History</h2>
          <ul>
            {purchases.map((p) => (
              <li key={p.id}>
                {new Date(p.date).toLocaleString()}: {p.network} - {p.bundle} - GHS {p.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
    }
