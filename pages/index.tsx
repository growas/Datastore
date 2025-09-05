// pages/index.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ddqytlmyglnqtwussldz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcXl0bG15Z2xucXR3dXNzbGR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjkwNzI4NywiZXhwIjoyMDcyNDgzMjg3fQ.nmZ1chou-RlUP5D5L4_fb8OEbC6bLyVAit677kboOok";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [bundles, setBundles] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState("");
  const [showAFA, setShowAFA] = useState(false);
  const [afaData, setAfaData] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
  });

  // Load wallet balance
  async function loadBalance(userEmail: string) {
    const { data } = await supabase
      .from("wallet")
      .select("balance")
      .eq("email", userEmail)
      .single();
    if (data) setBalance(data.balance);
  }

  // Load bundles
  async function loadBundles() {
    const { data } = await supabase.from("bundles").select("*");
    if (data) setBundles(data);
  }

  useEffect(() => {
    loadBundles();
  }, []);

  // Deposit into wallet with Paystack
  function handleDeposit() {
    if (!email || !phone || !amount) return alert("Fill all fields");

    const ref = "#a" + Math.floor(10000 + Math.random() * 90000);

    // @ts-ignore
    const handler = PaystackPop.setup({
      key: "pk_live_37c572730932ad4d495253ea03e2346f1f5b3aae",
      email,
      amount: amount * 100,
      currency: "GHS",
      ref,
      callback: async function (response: any) {
        alert(`Payment successful! Ref: ${response.reference}`);
        await supabase.from("wallet").upsert({ email, balance: balance + amount });
        loadBalance(email);
      },
      onClose: function () {
        alert("Payment cancelled");
      },
    });
    handler.openIframe();
  }

  // Purchase bundle
  async function handlePurchase() {
    if (!selectedBundle) return alert("Select a bundle");
    const { data: bundle } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", selectedBundle)
      .single();
    if (!bundle) return;
    if (balance < bundle.price) return alert("Insufficient wallet balance");

    const newBalance = balance - bundle.price;
    await supabase.from("wallet").upsert({ email, balance: newBalance });

    const refNum = "#a" + Math.floor(10000 + Math.random() * 90000);
    await supabase.from("orders").insert({
      email,
      bundle_id: bundle.id,
      amount: bundle.price,
      status: "processing",
      reference: refNum,
    });

    setBalance(newBalance);
    alert(
      `Purchased ${bundle.size} ${bundle.network} bundle. New balance: GHS ${newBalance}`
    );

    // WhatsApp admin alert
    const adminPhone = "0247918766";
    const msg = `Hi admin, check this order.
Number: ${phone}
Order ID: ${refNum}
GB: ${bundle.size}
Status: processing`;
    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }

  // Handle AFA registration (fixed fee: 8 GHS)
  async function handleAFARegistration() {
    if (!email || !phone || !afaData.name || !afaData.dob) {
      return alert("Fill all AFA fields");
    }
    const afaFee = 8;
    if (balance < afaFee) return alert("Insufficient wallet balance");

    const newBalance = balance - afaFee;
    await supabase.from("wallet").upsert({ email, balance: newBalance });

    const refNum = "#a" + Math.floor(10000 + Math.random() * 90000);
    await supabase.from("afa_registrations").insert({
      ...afaData,
      email,
      fee: afaFee,
      reference: refNum,
    });

    setBalance(newBalance);
    alert(`AFA registered successfully. Fee GHS ${afaFee} deducted.`);

    // WhatsApp admin alert
    const adminPhone = "0247918766";
    const msg = `New AFA registration:
Name: ${afaData.name}
Phone: ${afaData.phone}
Email: ${afaData.email}
DOB: ${afaData.dob}
Ref: ${refNum}`;
    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Data Store 4GH</h1>

      {/* Wallet Deposit */}
      <section style={sectionStyle}>
        <h2>Wallet Deposit</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            loadBalance(e.target.value);
          }}
        />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount GHS"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button onClick={handleDeposit}>Deposit</button>
        <p>Wallet Balance: GHS {balance}</p>
      </section>

      {/* Purchase Bundle */}
      <section style={sectionStyle}>
        <h2>Purchase Bundle</h2>
        <select
          value={selectedBundle}
          onChange={(e) => setSelectedBundle(e.target.value)}
        >
          <option value="">-- Select Bundle --</option>
          {bundles.map((b) => (
            <option key={b.id} value={b.id}>
              {b.network} {b.size} - GHS {b.price}
            </option>
          ))}
        </select>
        <button onClick={handlePurchase}>Purchase</button>
      </section>

      {/* AFA Registration */}
      <section style={sectionStyle}>
        <h2>
          AFA Registration{" "}
          <span
            style={{ cursor: "pointer", fontSize: "20px", marginLeft: "10px" }}
            onClick={() => setShowAFA(!showAFA)}
          >
            👤
          </span>
        </h2>
        {showAFA && (
          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              placeholder="Full Name"
              value={afaData.name}
              onChange={(e) => setAfaData({ ...afaData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={afaData.phone}
              onChange={(e) => setAfaData({ ...afaData, phone: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={afaData.email}
              onChange={(e) => setAfaData({ ...afaData, email: e.target.value })}
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={afaData.dob}
              onChange={(e) => setAfaData({ ...afaData, dob: e.target.value })}
            />
            <button onClick={handleAFARegistration}>Register (GHS 8)</button>
          </div>
        )}
      </section>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  marginBottom: "2rem",
  padding: "1rem",
  borderRadius: "8px",
  background: "#fff",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};
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
