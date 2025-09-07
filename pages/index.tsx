import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  // Update dashboard with purchases
  const updateDashboard = (network: string, bundleName: string, price: number) => {
    const newPurchase = {
      network,
      bundle: bundleName,
      amount: price,
      date: new Date().toLocaleString(),
    };

    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    purchases.push(newPurchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));

    const currentBalance = Number(localStorage.getItem("balance") || 0);
    localStorage.setItem("balance", (currentBalance - price).toString());
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-xl font-bold">
        Welcome {user.email} 🎉
      </h1>

      {/* Wallet Balance */}
      <div className="p-4 rounded-lg shadow bg-gray-100">
        <h2 className="font-semibold">Wallet Balance</h2>
        <p className="text-2xl text-green-600">
          GHS {Number(localStorage.getItem("balance") || 0).toFixed(2)}
        </p>
      </div>

      {/* Data Bundles */}
      <BundleSelector
        onSelect={(network, bundle, recipient, email) => {
          console.log("Selected bundle:", network, bundle, recipient, email);
          // ⚡ Call Paystack API here with bundle.price
          updateDashboard(network, bundle.name, bundle.price);
        }}
      />

      {/* AFA Registration */}
      <AfaRegistration
        onRegister={(formData) => {
          console.log("AFA Registration:", formData);
          const price = 8; // AFA membership fee
          // ⚡ Charge GHS 8.00 with Paystack
          updateDashboard("AFA", "Membership Registration", price);
        }}
      />

      {/* Purchase History */}
      <div className="p-4 rounded-lg shadow bg-gray-50">
        <h2 className="text-lg font-bold">Purchase History</h2>
        <ul className="list-disc pl-5 space-y-1">
          {JSON.parse(localStorage.getItem("purchases") || "[]").map(
            (p: any, idx: number) => (
              <li key={idx}>
                {p.date} — {p.network} {p.bundle} — GHS {p.amount}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
