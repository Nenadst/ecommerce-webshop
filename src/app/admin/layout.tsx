export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-sky-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="/admin" className="block hover:underline">
            Dashboard
          </a>
          <a href="/admin/users" className="block hover:underline">
            Users
          </a>
          <a href="/admin/products" className="block hover:underline">
            Products
          </a>
          <a href="/admin/categories" className="block hover:underline">
            Categories
          </a>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
