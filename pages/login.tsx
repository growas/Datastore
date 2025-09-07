// pages/login.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function Login() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/"); // redirect to dashboard
    }
  }, [user]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google", // You can change this to "github", "facebook", etc.
    });
    if (error) {
      console.error("Login error:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-xl shadow-md text-center space-y-4 w-80">
        <h1 className="text-2xl font-bold text-blue-600">Login</h1>
        <p className="text-gray-600">Sign in to access your wallet & dashboard</p>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
