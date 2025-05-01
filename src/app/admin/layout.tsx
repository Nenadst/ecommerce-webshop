import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-sky-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
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
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
