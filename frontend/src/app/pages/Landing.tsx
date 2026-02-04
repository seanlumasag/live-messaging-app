import { MessageCircle, Zap, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-green-500" />
            <span className="font-bold text-xl text-gray-900">LiveChat</span>
          </div>
          <Link
            to="/auth"
            className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with anyone,
            <br />
            <span className="text-green-500">instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Simple, fast, and secure messaging that brings your conversations to life.
            Stay connected with friends, family, and colleagues.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-4 bg-green-500 text-white text-lg rounded-full hover:bg-green-600 transition-colors shadow-lg"
          >
            Start Messaging Now
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Lightning Fast</h3>
            <p className="text-gray-600">
              Send and receive messages instantly with real-time delivery.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure & Private</h3>
            <p className="text-gray-600">
              Your conversations are protected with end-to-end encryption.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Group Chats</h3>
            <p className="text-gray-600">
              Create groups and chat with multiple people at the same time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2026 LiveChat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
