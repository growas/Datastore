// pages/index.tsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [bundles, setBundles] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState("");
  const [showAFA, setShowAFA] = useState(false);

  // Load wallet balance
  const loadBalance = async () => {
    if (!email) return;
    const { data } = await supabase
      .from("wallet")
      .select("balance")
      .eq("email", email)
      .single();

    if (data) setBalance(data.balance);
  };

  // Load bundles
  const loadBundles = async () => {
    const { data } = await supabase.from("bundles").select("*");
    if (data) setBundles(data);
  };

  useEffect(() => {
    loadBundles();
  }, []);

  // Handle deposit (frontend → Paystack API)
  const handleDeposit = async () => {
    if (!email || !phone || !amount) {
      alert("Fill all fields");
      return;
    }

    const response = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, amount }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Deposit successful");
      setBalance(balance + amount);
    } else {
      alert("Payment failed");
    }
  };

  // Handle purchase (frontend → purchase API)
  const handlePurchase = async () => {
    if (!selectedBundle) return alert("Select a bundle");

    const response = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, bundleId: selectedBundle }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Bundle purchased successfully!");
      setBalance(balance - result.price);
    } else {
      alert(result.message || "Purchase failed");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Data Store 4GH</h1>

      {/* Wallet Deposit */}
      <section className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Wallet Deposit</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={loadBalance}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          type="number"
          placeholder="Amount GHS"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button
          onClick={handleDeposit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Deposit
        </button>
        <p className="mt-2 font-semibold">Wallet Balance: GHS {balance}</p>
      </section>

      {/* Purchase Bundle */}
      <section className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Purchase Bundle</h2>
        <select
          className="border p-2 w-full mb-2"
          value={selectedBundle}
          onChange={(e) => setSelectedBundle(e.target.value)}
        >
          <option value="">-- Select Bundle --</option>
          {bundles.map((b) => (
            <option key={b.id} value={b.id}>
              {b.network} - {b.size} - GHS {b.price}
            </option>
          ))}
        </select>
        <button
          onClick={handlePurchase}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Purchase
        </button>
      </section>

      {/* AFA Registration */}
      <section className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          AFA
          <span
            className="ml-2 cursor-pointer"
            onClick={() => setShowAFA(!showAFA)}
          >
            👤
          </span>
        </h2>
        {showAFA && (
          <div className="mt-2">
            <input className="border p-2 w-full mb-2" placeholder="Full Name" />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Phone Number"
            />
            <input className="border p-2 w-full mb-2" placeholder="Email" />
            <input className="border p-2 w-full mb-2" type="date" />
            <button className="bg-purple-600 text-white px-4 py-2 rounded">
              Register AFA
            </button>
          </div>
        )}
      </section>
    </div>
  );
      }
