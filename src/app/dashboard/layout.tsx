'use client';

import { RequireAuth } from '@/components/AuthProvider';
import { logout } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b-2 border-purple-500 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">Bizta Dashboard</h1>
                <nav className="flex gap-4">
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/dashboard'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                        : 'text-purple-200 hover:bg-purple-800/50'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard/conversations"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname?.startsWith('/dashboard/conversations')
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                        : 'text-purple-200 hover:bg-purple-800/50'
                    }`}
                  >
                    Conversations
                  </Link>
                </nav>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-md transition-all shadow-md hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
