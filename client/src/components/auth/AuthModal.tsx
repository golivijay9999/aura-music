import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, register, guestLogin, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password, email);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await guestLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f0a1c] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full filter blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card if already logged in */}
        {user && !user.isGuest ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-purple-500/40 bg-zinc-900 shadow-xl">
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{user.username}</h3>
                <p className="text-xs text-purple-300 font-mono">Premium Listener</p>
                {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2">
              <p className="text-xs font-semibold text-gray-300">Preferences</p>
              <div className="flex flex-wrap gap-1.5">
                {(user.favoriteLanguages || []).map((l) => (
                  <span key={l} className="text-[10px] px-2.5 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full capitalize">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-bold text-xs rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Account Access</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Welcome Back' : 'Create Free Account'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Synchronize your liked songs, custom playlists, and listening rooms.
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex p-1 bg-zinc-950/80 rounded-2xl border border-white/5">
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'register' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2.5 bg-zinc-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="text-xs text-gray-300 font-medium block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-zinc-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-zinc-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xl shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Quick Guest Access */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleGuest}
                className="text-xs text-gray-400 hover:text-cyan-400 transition-colors underline"
              >
                Continue instantly as Guest Explorer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
