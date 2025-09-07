import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";

export default function Home() {
  const updateDashboard = (network: string, bundleName: string, price: number) => {
    // Update purchase history
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

  return (
    <div className="space-y-8 p-4">
      <BundleSelector
        onSelect={(network, bundle, recipient, email) => {
          console.log("Selected bundle:", network, bundle);
          console.log("Recipient:", recipient);
          console.log("Email:", email);
          // ⚡ Call your Paystack API here with:
          // bundle.price, recipient, email
          // Do not modify your live payment logic
          updateDashboard(network, bundle.name, bundle.price);
        }}
      />

      <AfaRegistration
        onRegister={(formData) => {
          console.log("AFA Registration:", formData);
          const price = 8; // AFA membership fee
          // ⚡ Charge GHS 8.00 with Paystack here
          updateDashboard("AFA", "Membership Registration", price);
        }}
      />
    </div>
  );
}
