import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function Home() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const updateDashboard = async (
    network: string,
    bundleName: string,
    price: number,
    recipient: string,
    email?: string,
    method: "wallet" | "paystack" = "paystack"
  ) => {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    if (method === "wallet") {
      // Deduct wallet balance in Supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (profile.balance < price) {
        alert("Insufficient wallet balance.");
        return;
      }

      // Update balance
      await supabase
        .from("profiles")
        .update({ balance: profile.balance - price })
        .eq("id", user.id);

      // Save purchase
      await supabase.from("purchases").insert([
        {
          user_id: user.id,
          network,
          bundle: bundleName,
          amount: price,
          recipient,
          email,
        },
      ]);

      alert("✅ Purchase successful using Wallet");
    } else {
      // Paystack flow
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network, bundle: bundleName, price, recipient, email }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // redirect to Paystack
      } else {
        alert("❌ Payment failed");
      }
    }
  };

  return (
    <div className="space-y-8 p-4">
      <BundleSelector
        onSelect={(network, bundle, recipient, email) => {
          // Ask user how to pay
          const method = confirm("Pay with wallet? Click 'OK' for Wallet or 'Cancel' for Paystack")
            ? "wallet"
            : "paystack";

          updateDashboard(network, bundle.name, bundle.price, recipient, email, method);
        }}
      />

      <AfaRegistration
        onRegister={(formData) => {
          const method = confirm("Pay with wallet? Click 'OK' for Wallet or 'Cancel' for Paystack")
            ? "wallet"
            : "paystack";

          const price = 8; // AFA fee
          updateDashboard("AFA", "Membership Registration", price, formData.phone, formData.email, method);
        }}
      />
    </div>
  );
}
