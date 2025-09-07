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
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 8, // AFA membership fee
          email: form.email,
        }),
      });
      const data = await res.json();
      if (data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert("Payment failed to start");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong starting payment");
    }

    onRegister(form);
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
        <input
          type="email"
          name="email"
          placeholder="Email (for Paystack receipt)"
          value={form.email}
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
