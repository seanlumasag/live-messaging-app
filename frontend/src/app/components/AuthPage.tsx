import { useState } from "react";
import { useNavigate } from "react-router";
import { MessageCircle } from "lucide-react";
import { login, signup, storeAuth } from "../lib/api";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = isLogin
        ? await login({ email, password })
        : await signup({
            email,
            username,
            password,
            displayName: displayName || username,
          });
      storeAuth(response);
      navigate("/chat");
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to authenticate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#000000] flex items-start justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className={`w-full ${isLogin ? "max-w-md" : "max-w-2xl"}`}>
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-3 sm:mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-white mb-2">Messages</h1>
          <p className="text-gray-400">Stay connected with your team</p>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-800">
          <div className="flex gap-2 mb-6 p-1 bg-[#2c2c2e] rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                isLogin
                  ? "bg-[#3a3a3c] text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                !isLogin
                  ? "bg-[#3a3a3c] text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className={isLogin ? "space-y-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}
          >
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div className={!isLogin ? "sm:col-span-2" : ""}>
              <label className="block text-sm text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:col-span-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-70 sm:col-span-2"
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
            </button>

            {isLogin && (
              <button
                type="button"
                className="w-full text-sm text-blue-500 hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
