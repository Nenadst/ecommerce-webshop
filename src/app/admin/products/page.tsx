'use client';

import { useRouter } from 'next/navigation';
import { gql, useQuery, useMutation } from '@apollo/client';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Toaster } from 'react-hot-toast';
import { Product } from './types';
import Link from 'next/link';

const GET_PRODUCTS = gql`
  query {
    products {
      id
      name
      description
      price
      quantity
      image
      category {
        name
      }
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export default function AdminProductsPage() {
  const router = useRouter();
  const { data: productData, refetch: refetchProducts } = useQuery<{ products: Product[] }>(
    GET_PRODUCTS
  );

  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const [modal, setModal] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  const handleAddProduct = () => {
    router.push('/admin/products/new');
  };

  const handleDeleteProduct = (id: string) => {
    setModal({
      show: true,
      message: 'Are you sure you want to delete this product?',
      onConfirm: async () => {
        await deleteProduct({ variables: { id } });
        await refetchProducts();
      },
    });
  };

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
            {productData?.products?.map((product) => (
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
                    className="bg-slate-300 hover:bg-amber-500 text-[#292D32] rounded-full p-1 shadow relative group"
                    aria-label="Delete product"
                  >
                    <Trash2 size={16} />
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
            )) || <p>No products found.</p>}
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
      <Toaster />
    </>
  );
}
