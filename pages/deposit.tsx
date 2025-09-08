import React, { useState } from "react";
import { supabase } from "./supabaseClient"; // Change path as needed
import { PaystackButton } from "react-paystack";

const DepositFormWithPaystack = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  // Paystack config
  const publicKey = "YOUR_PAYSTACK_PUBLIC_KEY"; // Replace with your Paystack public key
  const depositAmount = Number(amount);
  const paystackAmount = depositAmount * 100; // Paystack expects amount in kobo/pesewas

  // Called after Paystack payment success
  const onSuccess = async (reference: any) => {
    setDepositing(true);

    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      alert("Error checking user: " + selectError.message);
      setDepositing(false);
      return;
    }

    let userId;
    if (existingUser) {
      userId = existingUser.id;
      // Update user balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ balance: existingUser.balance + depositAmount })
        .eq("email", email);

      if (updateError) {
        alert("Deposit failed: " + updateError.message);
        setDepositing(false);
        return;
      }
    } else {
      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ email, balance: depositAmount }])
        .select()
        .single();

      if (insertError) {
        alert("Deposit failed: " + insertError.message);
        setDepositing(false);
        return;
      }

      userId = newUser.id;
    }

    // Update/create wallet for the user
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError && walletError.code !== "PGRST116") {
      alert("Error checking wallet: " + walletError.message);
      setDepositing(false);
      return;
    }

    if (wallet) {
      // Update wallet balance
      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({ balance: wallet.balance + depositAmount })
        .eq("user_id", userId);

      if (walletUpdateError) {
        alert("Wallet update failed: " + walletUpdateError.message);
        setDepositing(false);
        return;
      }
    } else {
      // Create wallet
      const { error: walletInsertError } = await supabase
        .from("wallets")
        .insert([{ user_id: userId, balance: depositAmount }]);

      if (walletInsertError) {
        alert("Wallet creation failed: " + walletInsertError.message);
        setDepositing(false);
        return;
      }
    }

    alert(`Deposited GHS ${depositAmount} successfully!`);
    window.location.href = "/dashboard";
  };

  const onClose = () => {
    alert("Payment window closed. Deposit was not completed.");
  };

  const componentProps = {
    email,
    amount: paystackAmount,
    currency: "GHS",
    publicKey,
    text: depositing ? "Processing..." : "Deposit with Paystack",
    onSuccess,
    onClose,
    disabled: depositing || !email || depositAmount <= 0,
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        // Payment is triggered by PaystackButton, not form submit
      }}
    >
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
        min={1}
      />
      <PaystackButton {...componentProps} />
    </form>
  );
};

export default DepositFormWithPaystack;
