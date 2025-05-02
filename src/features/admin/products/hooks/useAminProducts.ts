import { useQuery, useMutation, Reference } from '@apollo/client';
import { useState } from 'react';
import { GET_PRODUCTS, DELETE_PRODUCT } from '@/entities/product/api/product.queries';
import { Product } from '@/entities/product/types/product.types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export type ModalState = {
  show: boolean;
  message: string;
  onConfirm: () => void;
  productId?: string;
};

export function useAdminProducts() {
  const router = useRouter();
  const { data: productData, loading: productsLoading } = useQuery<{ products: Product[] }>(
    GET_PRODUCTS
  );

  const [modal, setModal] = useState<ModalState>({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  const [deleteProduct, { loading: deleteLoading }] = useMutation(DELETE_PRODUCT, {
    update(cache, { data }) {
      if (data?.deleteProduct) {
        cache.modify({
          fields: {
            products(existingRefs: readonly Reference[] = [], { readField }) {
              return existingRefs.filter(
                (ref: Reference) => readField('id', ref) !== modal.productId
              );
            },
          },
        });
      }
    },
  });

  const handleAddProduct = () => router.push('/admin/products/new');

  const handleDeleteProduct = (id: string) => {
    setModal({
      show: true,
      message: 'Are you sure you want to delete this product?',
      productId: id,
      onConfirm: async () => {
        try {
          const { data } = await deleteProduct({ variables: { id } });
          if (data?.deleteProduct) {
            toast.success('Product deleted successfully!');
          } else {
            toast.error('Failed to delete product.');
          }
        } catch (err) {
          toast.error('An error occurred while deleting.');
          console.log(err);
        } finally {
          setModal((prev) => ({ ...prev, show: false }));
        }
      },
    });
  };

  return {
    products: productData?.products || [],
    productsLoading,
    modal,
    setModal,
    handleDeleteProduct,
    deleteLoading,
    handleAddProduct,
  };
}
