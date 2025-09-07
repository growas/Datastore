import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";

export default function Home() {
  const updateDashboard = (
    network: string,
    bundleName: string,
    price: number
  ) => {
    // Save purchase history
    const newPurchase = {
      network,
      bundle: bundleName,
      amount: price,
      date: new Date().toLocaleString(),
    };

    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    purchases.push(newPurchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));

    // Deduct from balance
    const currentBalance = Number(localStorage.getItem("balance") || 0);
    localStorage.setItem("balance", (currentBalance - price).toString());
  };

  const handleBundleSelect = (
    network: string,
    bundle: { name: string; price: number },
    method: "wallet" | "paystack",
    recipient: string,
    email?: string
  ) => {
    console.log("Selected:", network, bundle, method, recipient, email);

    if (method === "wallet") {
      // ⚡ Wallet purchase
      updateDashboard(network, bundle.name, bundle.price);
      alert(
        `✅ Bundle ${bundle.name} purchased with Wallet for ${recipient}.`
      );
    } else {
      // ⚡ Paystack purchase
      alert(
        `Redirecting to Paystack for ${bundle.name} (GHS ${bundle.price})...`
      );
      // Here you integrate your Paystack API call (using your live keys)
    }
  };

  const handleAfaRegister = (formData: any) => {
    console.log("AFA Registration:", formData);
    const price = 8; // AFA membership fee

    // Charge with Paystack for AFA (always Paystack)
    alert(
      `Redirecting to Paystack for AFA Registration (GHS ${price})...`
    );

    // ⚡ Update dashboard after payment
    updateDashboard("AFA", "Membership Registration", price);
  };

  return (
    <div className="space-y-8 p-4">
      <BundleSelector onSelect={handleBundleSelect} />

      <AfaRegistration onRegister={handleAfaRegister} />
    </div>
  );
  }
