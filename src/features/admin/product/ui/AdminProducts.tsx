'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { useAdminProducts } from '@/features/admin/product/hooks/useAminProducts';

export default function AdminProducts() {
  const router = useRouter();
  const { products, productsLoading, modal, setModal, handleDeleteProduct, deleteLoading } =
    useAdminProducts();

  const handleAddProduct = () => router.push('/admin/products/new');

  if (productsLoading)
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-900"></div>
        <span className="ml-4 text-sky-900 font-medium">Loading products...</span>
      </div>
    );

  return (
    <>
      <div className="p-6 space-y-10">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-sky-900">Products</h2>
            <button
              onClick={handleAddProduct}
              className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-800"
            >
              + Add New Product
            </button>
          </div>
          <div className="flex flex-wrap gap-6">
            {products.length ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white shadow-md rounded p-4 flex flex-col gap-2 border hover:shadow-lg transition w-[250px]"
                >
                  <div className="flex justify-end gap-2 mb-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="bg-slate-300 hover:bg-blue-500 text-[#292D32] rounded-full p-1 shadow relative group"
                      aria-label="Edit product"
                    >
                      <Pencil size={16} />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        Edit Product
                      </span>
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className={`bg-slate-300 hover:bg-amber-500 text-[#292D32] rounded-full p-1 shadow relative group ${
                        deleteLoading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      aria-label="Delete product"
                      disabled={deleteLoading}
                    >
                      {deleteLoading && modal.productId === product.id ? (
                        <span className="animate-spin w-4 h-4 border-b-2 border-red-600 rounded-full block"></span>
                      ) : (
                        <Trash2 size={16} />
                      )}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        Delete Product
                      </span>
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
                  <p className="text-sm">💰 Price: ${product.price}</p>
                  <p className="text-sm">📦 Quantity: {product.quantity}</p>
                  <p className="text-sm">🏷️ Category: {product.category?.name}</p>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
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
        />
      )}
    </>
  );
}
