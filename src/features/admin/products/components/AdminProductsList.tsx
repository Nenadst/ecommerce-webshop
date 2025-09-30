'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/entities/product/types/product.types';
import FullScreenSpinner from '@/shared/components/spinner/FullScreenSpinner';
import NoData from '@/shared/components/no-data/NoData';

interface AdminProductsListProps {
  products: Product[];
  loading: boolean;
  deleteLoading: boolean;
  onDeleteProduct: (id: string) => void;
  onAddProduct: () => void;
}

export default function AdminProductsList({
  products,
  loading,
  deleteLoading,
  onDeleteProduct,
  onAddProduct,
}: AdminProductsListProps) {
  if (loading) {
    return <FullScreenSpinner />;
  }

  if (!products.length) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <NoData name="product" handleOnClick={onAddProduct} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product: Product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      <Image
                        src={product.image || '/assets/img/no-product.png'}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category?.name || 'No Category'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">€{product.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900 mr-2">{product.quantity}</div>
                    {product.quantity > 10 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    ) : product.quantity > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full p-2 transition-colors"
                      title="Edit Product"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      disabled={deleteLoading}
                      className={`bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 transition-colors ${
                        deleteLoading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
