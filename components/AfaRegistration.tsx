import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";

export default function AfaRegistration({
  onRegister,
}: {
  onRegister: (data: any) => void;
}) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    location: "",
    dob: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = 8; // AFA membership fee

    // Update purchase history
    const newPurchase = {
      network: "AFA",
      bundle: "Membership Registration",
      amount: price,
      date: new Date().toLocaleString(),
    };

    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    purchases.push(newPurchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));

    // Deduct from balance
    const currentBalance = Number(localStorage.getItem("balance") || 0);
    localStorage.setItem("balance", (currentBalance - price).toString());

    // Call original handler for Paystack payment
    onRegister(form);

    // Reset form
    setForm({
      fullName: "",
      phone: "",
      location: "",
      dob: "",
    });
  };

  return (
    <div className="p-4 rounded-lg shadow bg-gray-50 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 text-green-700">
        <UserIcon className="w-6 h-6 text-green-600" />
        AFA Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Register (GHS 8.00)
        </button>
      </form>
    </div>
  );
}
