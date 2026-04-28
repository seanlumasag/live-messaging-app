import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Lock, Moon, Sun, User } from "lucide-react";
import { changePassword, clearAuth, deleteAccount, getMe, updateMe } from "../lib/api";

export function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((user) => {
        setEmail(user.email);
        setUsername(user.username);
        setDisplayName(user.displayName);
        setBio(user.bio ?? "");
      })
      .catch(() => {
        clearAuth();
        navigate("/");
      });
  }, [navigate]);

  const saveProfile = async () => {
    setError(null);
    setMessage(null);
    try {
      const user = await updateMe({ email, username, displayName, bio });
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("username", user.username);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to update profile.");
    }
  };

  const savePassword = async () => {
    setError(null);
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to update password.");
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    setMessage(null);
    if (!deletePassword.trim()) {
      setError("Enter your password to delete your account.");
      return;
    }
    try {
      await deleteAccount({ password: deletePassword });
      clearAuth();
      navigate("/");
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to delete account.");
    }
  };

  const signOut = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/chat")} className="p-2 hover:bg-[#2c2c2e] rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <h1 className="text-3xl text-white">Settings</h1>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {message && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>}

        <div className="space-y-6">
          <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl text-white">Profile</h2>
            </div>

            <div className="space-y-4">
              <Field label="Display Name" value={displayName} onChange={setDisplayName} />
              <Field label="Username" value={username} onChange={setUsername} />
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <button onClick={saveProfile} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                {isDarkMode ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-purple-500" />}
              </div>
              <h2 className="text-xl text-white">Appearance</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Dark Mode</p>
                <p className="text-sm text-gray-400">Choose your preferred theme</p>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`relative w-14 h-8 rounded-full transition-colors ${isDarkMode ? "bg-blue-500" : "bg-gray-600"}`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${isDarkMode ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Lock className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl text-white">Security</h2>
            </div>
            <div className="space-y-4">
              <Field label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} />
              <Field label="New Password" type="password" value={newPassword} onChange={setNewPassword} />
              <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
              <button onClick={savePassword} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                Update Password
              </button>
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-red-500/20">
            <h2 className="text-xl text-white mb-4">Delete Account</h2>
            <Field label="Password" type="password" value={deletePassword} onChange={setDeletePassword} />
            <button onClick={handleDeleteAccount} className="mt-4 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20">
              Delete Account
            </button>
          </div>

          <button onClick={signOut} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  );
}
