'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span className="text-2xl">⚡</span>
          <span>Prompt Studio</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/history"
            className={`transition-colors ${
              pathname === '/history' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Riwayat
          </Link>

          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-gray-500">
                👋 {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                🚪 Keluar
              </button>
            </div>
          ) : status === 'unauthenticated' ? (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
