'use client';

import { ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggingOut = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoggingOut.current) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router, pathname]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-sky-900 text-lg">Redirecting to login...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600 text-lg">Access Forbidden: Admin only</div>
      </div>
    );
  }

  const handleLogout = () => {
    isLoggingOut.current = true;
    logout();
    toast.success('Logged out successfully!');
    router.push('/');
  };
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-sky-900 text-white p-6">
        <Link href="/" className="flex items-center space-x-2 mb-5 hover:underline">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <nav className="space-y-2 mb-8">
          <Link
            href="/admin"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === '/admin' ? 'bg-sky-700 font-semibold' : 'hover:bg-sky-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/admin/orders') ? 'bg-sky-700 font-semibold' : 'hover:bg-sky-800'
            }`}
          >
            Orders
          </Link>
          <Link
            href="/admin/users"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/admin/users') ? 'bg-sky-700 font-semibold' : 'hover:bg-sky-800'
            }`}
          >
            Users
          </Link>
          <Link
            href="/admin/products"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/admin/products')
                ? 'bg-sky-700 font-semibold'
                : 'hover:bg-sky-800'
            }`}
          >
            Products
          </Link>
          <Link
            href="/admin/categories"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/admin/categories')
                ? 'bg-sky-700 font-semibold'
                : 'hover:bg-sky-800'
            }`}
          >
            Categories
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-sky-200 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
