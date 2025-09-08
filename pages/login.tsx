import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

type Provider = "google" | "github" | "facebook";

export default function Login() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      setTimeout(() => router.push("/"), 300);
    }
  }, [user, router]);

  useEffect(() => {
    loginButtonRef.current?.focus();
  }, []);

  // OAuth login
  const handleLoginOAuth = async (provider: Provider) => {
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  // Email/password login
  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    // On success, Supabase redirects automatically
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" aria-busy={loading}>
      <div
        className="p-8 bg-white rounded-xl shadow-md text-center space-y-4 w-80"
        role="main"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="text-2xl font-bold text-blue-600">Login</h1>
        <p className="text-gray-600">Sign in to access your wallet & dashboard</p>

        {errorMsg && (
          <p className="text-red-500" role="alert">{errorMsg}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="ml-2">Signing in...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OAuth login */}
            <div className="space-y-2">
              <button
                ref={loginButtonRef}
                onClick={() => handleLoginOAuth("google")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sign in with Google"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => handleLoginOAuth("github")}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700"
                aria-label="Sign in with GitHub"
              >
                Sign in with GitHub
              </button>
              <button
                onClick={() => handleLoginOAuth("facebook")}
                className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
                aria-label="Sign in with Facebook"
              >
                Sign in with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center space-x-2">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-400">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Email/password login */}
            <form onSubmit={handleLoginEmail} className="space-y-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full"
                required
                aria-label="Email"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full"
                required
                aria-label="Password"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Sign in with Email
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
