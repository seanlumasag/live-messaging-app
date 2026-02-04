import { ArrowLeft, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Settings() {
  const email = localStorage.getItem('userEmail') || 'you@example.com';
  const userId = localStorage.getItem('userId') || 'unknown';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Manage your profile and preferences</p>
            </div>
          </div>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to chat
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account</h2>
                <p className="text-sm text-gray-500">Your basic account details</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">User ID</span>
                <input
                  type="text"
                  value={userId}
                  readOnly
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Password</span>
                <input
                  type="password"
                  value="••••••••"
                  readOnly
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700"
                />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete account</h2>
                <p className="text-sm text-gray-500">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Re-enter password to confirm
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </label>
            </div>
            <button className="mt-4 w-full rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600">
              Delete account
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
