'use client';

import { useState, FormEvent } from 'react';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // Reload to refresh auth state
      window.location.href = '/dashboard';
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-blue-100">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">Bizta</h1>
          <p className="text-gray-600 font-medium text-lg">Welcome Back</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-base text-gray-800 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-blue-50/50 placeholder:text-gray-400"
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg font-bold text-gray-800 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all tracking-widest bg-blue-50/50 placeholder:text-gray-400"
              placeholder="••••••••"
              style={{ fontSize: '1.25rem' }}
            />
          </div>

          {error && (
            <div className="p-4 text-sm font-semibold text-red-800 bg-red-100 border-2 border-red-300 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl transform hover:scale-[1.02]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
