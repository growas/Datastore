import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";
import { useRouter } from "next/router";

export default function Home() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

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

  // ✅ Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-8 p-4">
      {/* Logout button at the top */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Welcome, {user?.email}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <BundleSelector
        onSelect={(network, bundle) => {
          console.log("Selected bundle:", network, bundle);
          updateDashboard(network, bundle.name, bundle.price);
        }}
      />

      <AfaRegistration
        onRegister={(formData) => {
          console.log("AFA Registration:", formData);
          const price = 8;
          updateDashboard("AFA", "Membership Registration", price);
        }}
      />
    </div>
  );
}
