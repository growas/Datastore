const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || amount <= 0) {
    alert("Enter a valid email and amount");
    return;
  }

  // ✅ Save email for later (Dashboard will pick this up)
  localStorage.setItem("userEmail", email);

  // Create or update user in Supabase
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    await supabase
      .from("users")
      .update({ balance: existingUser.balance + amount })
      .eq("email", email);
  } else {
    await supabase.from("users").insert([{ email, balance: amount }]);
  }

  alert(`Deposited GHS ${amount} successfully!`);
  window.location.href = "/dashboard"; // ✅ Redirect after deposit
};
