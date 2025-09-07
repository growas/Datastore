import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(form);

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please make a deposit first to create your wallet.");
      return;
    }

    // Charge is always GHS 8.00 for registration
    const price = 8;

    // Fetch user wallet
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (error || !user) {
      alert("User not found. Please deposit first.");
      return;
    }

    if (user.balance < price) {
      alert("Insufficient wallet balance!");
      return;
    }

    // Deduct from balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: user.balance - price })
      .eq("email", userEmail);

    if (updateError) {
      alert("Failed to update wallet balance. Try again.");
      return;
    }

    // Save registration in purchases history
    await supabase.from("purchases").insert([
      {
        email: userEmail,
        network: "AFA",
        bundle: "Membership Registration",
        amount: price,
        date: new Date().toISOString(),
      },
    ]);

    alert("AFA Registration successful. GHS 8.00 deducted from wallet ✅");
  };

  return (
    <div className="p-4 rounded-lg shadow bg-gray-50 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
        <UserIcon className="w-6 h-6 text-blue-600" />
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
