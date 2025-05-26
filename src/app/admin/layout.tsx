'use client';

import { useLogout } from '@/shared/hooks/useLogout';
import { ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logoutMutation, logoutLoading } = useLogout({ redirectTo: '/' });
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 h-screen bg-sky-900 text-white p-6 flex flex-col justify-between fixed left-0 top-0">
        <div>
          <Link href="/" className="flex items-center space-x-2 mb-5 hover:underline">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>
          <nav className="space-y-2">
            <Link href="/admin" className="block hover:underline">
              Dashboard
            </Link>
            <Link href="/admin/users" className="block hover:underline">
              Users
            </Link>
            <Link href="/admin/products" className="block hover:underline">
              Products
            </Link>
            <Link href="/admin/categories" className="block hover:underline">
              Categories
            </Link>
          </nav>
        </div>
        <div>
          <button
            onClick={() => logoutMutation()}
            disabled={logoutLoading}
            className="w-full flex items-center space-x-2 py-2 px-4 bg-red-600 rounded hover:bg-red-500 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>{logoutLoading ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 ml-64 overflow-y-auto">{children}</main>
    </div>
  );
}
