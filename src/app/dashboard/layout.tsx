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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold">Bizta Dashboard</h1>
                <nav className="flex gap-4">
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/dashboard'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard/conversations"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname?.startsWith('/dashboard/conversations')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Conversations
                  </Link>
                </nav>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
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
