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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Bizta Dashboard</h1>
                <nav className="flex gap-4">
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      pathname === '/dashboard'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard/conversations"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      pathname?.startsWith('/dashboard/conversations')
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    Conversations
                  </Link>
                </nav>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all shadow-sm hover:shadow-md"
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
