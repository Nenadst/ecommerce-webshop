'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/entities/product/types/product.types';
import FullScreenSpinner from '@/shared/components/spinner/FullScreenSpinner';
import NoData from '@/shared/components/no-data/NoData';

interface AdminProductsGridProps {
  products: Product[];
  loading: boolean;
  deleteLoading: boolean;
  onDeleteProduct: (id: string) => void;
  onAddProduct: () => void;
}

export default function AdminProductsGrid({
  products,
  loading,
  deleteLoading,
  onDeleteProduct,
  onAddProduct,
}: AdminProductsGridProps) {
  if (loading) {
    return <FullScreenSpinner />;
  }

  if (!products.length) {
    return (
      <div className="col-span-full flex justify-center items-center min-h-[300px]">
        <NoData name="product" handleOnClick={onAddProduct} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product: Product) => (
        <div
          key={product.id}
          className="bg-white shadow-md rounded p-4 flex flex-col gap-2 border hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-end gap-2 mb-2">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="bg-slate-300 hover:bg-blue-500 text-[#292D32] rounded-full p-1 shadow group transition-colors"
              title="Edit Product"
            >
              <Pencil size={16} />
            </Link>
            <button
              onClick={() => onDeleteProduct(product.id)}
              disabled={deleteLoading}
              className={`bg-slate-300 hover:bg-red-500 text-[#292D32] rounded-full p-1 shadow transition-colors ${
                deleteLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
              title="Delete Product"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="relative w-full h-48 mb-3 bg-white">
            <Image
              src={product.images?.[0] || '/assets/img/no-product.png'}
              alt={product.name}
              fill
              className="rounded object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <h3 className="text-lg font-semibold text-sky-900 line-clamp-2">{product.name}</h3>
          <p className="text-gray-700 text-sm line-clamp-3">{product.description}</p>

          <div className="mt-auto space-y-1">
            <p className="text-sm font-medium text-green-600">💰 €{product.price}</p>
            <p className="text-sm text-gray-600">📦 {product.quantity} in stock</p>
            <p className="text-sm text-blue-600">🏷️ {product.category?.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
