import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); // redirect to wallet dashboard
    }
  }, [user]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const email = e.target.email.value;

    // Magic link login
    await supabase.auth.signInWithOtp({ email });
    alert("Check your email for the magic login link!");
  };

  return (
    <div className="p-8 flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4 w-72">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send Magic Link
        </button>
      </form>
    </div>
  );
}
