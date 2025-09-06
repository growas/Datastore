import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 8 }) // Example: 8 Ghs
      });

      const data = await response.json();

      if (data.authorization_url) {
        // Open Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        alert("Failed to initialize payment");
      }
    } catch (error) {
      console.error(error);
      alert("Error initiating payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Deposit Example</h1>
      <button onClick={handleDeposit} disabled={loading}>
        {loading ? "Processing..." : "Deposit 8 Ghs"}
      </button>
    </div>
  );
}
