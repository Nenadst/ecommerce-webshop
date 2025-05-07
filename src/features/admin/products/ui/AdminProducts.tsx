'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import FullScreenSpinner from '@/shared/components/spinner/FullScreenSpinner';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '@/entities/category/api/category.queries';
import { Category } from '@/entities/category/types/category.types';
import { Product } from '@/entities/product/types/product.types';
import { useAdminProducts } from '../hooks/useAminProducts';

export default function AdminProducts() {
  const {
    products,
    totalPages,
    total,
    page,
    setPage,
    setSort,
    modal,
    setModal,
    deleteLoading,
    handleDeleteProduct,
    handleAddProduct,
    productsLoading,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    limit,
    setLimit,
  } = useAdminProducts();

  const { data: categoryData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  return (
    <>
      <div className="p-6 space-y-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-sky-900">Products</h2>
          <button
            onClick={handleAddProduct}
            className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-800"
          >
            + Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Categories</option>
            {categoryData?.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-4 items-center mt-4">
          <label className="font-medium text-sm">Sort By:</label>
          <select
            onChange={(e) => {
              const [field, order] = e.target.value.split(':');
              setSort({ field, order: parseInt(order) as 1 | -1 });
            }}
            className="border p-2 rounded"
          >
            <option value="createdAt:-1">Newest First</option>
            <option value="createdAt:1">Oldest First</option>
            <option value="price:1">Price: Low to High</option>
            <option value="price:-1">Price: High to Low</option>
            <option value="name:1">Name A-Z</option>
            <option value="name:-1">Name Z-A</option>
          </select>
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[250px]">
          {productsLoading ? (
            <FullScreenSpinner />
          ) : (
            <>
              {products.length ? (
                products.map((product: Product) => (
                  <div
                    key={product.id}
                    className="bg-white shadow-md rounded p-4 flex flex-col gap-2 border hover:shadow-lg transition"
                  >
                    <div className="flex justify-end gap-2 mb-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="bg-slate-300 hover:bg-blue-500 text-[#292D32] rounded-full p-1 shadow group"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteLoading}
                        className={`bg-slate-300 hover:bg-amber-500 text-[#292D32] rounded-full p-1 shadow group ${
                          deleteLoading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Image
                      src={product.image || '/assets/img/no-product.png'}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="rounded object-cover w-full h-48"
                    />
                    <h3 className="text-lg font-semibold text-sky-900">{product.name}</h3>
                    <p className="text-gray-700 text-sm">{product.description}</p>
                    <p className="text-sm">💰 ${product.price}</p>
                    <p className="text-sm">📦 {product.quantity} in stock</p>
                    <p className="text-sm">🏷️ {product.category?.name}</p>
                  </div>
                ))
              ) : (
                <p>No products found.</p>
              )}
            </>
          )}
        </div>

        <div className="relative mt-10">
          {/* Limit Selector (Left aligned) */}
          <div className="absolute left-0 top-0 flex items-center gap-2">
            <label htmlFor="limit" className="text-sm font-medium">
              Show:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded px-3 py-1 text-sm appearance-none bg-white bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem_1rem] pr-8"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg fill='none' stroke='%234B5563' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">products per page</span>
          </div>

          {/* Center: Pagination */}
          <div className="flex gap-3 items-center justify-center mx-auto">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {page} of {totalPages} ({total} results)
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modal.show && (
        <ConfirmModal
          show={modal.show}
          message={modal.message}
          onConfirm={() => {
            modal.onConfirm();
            setModal((prev) => ({ ...prev, show: false }));
          }}
          onCancel={() => setModal((prev) => ({ ...prev, show: false }))}
          deleteLoading={deleteLoading}
        />
      )}
    </>
  );
}
