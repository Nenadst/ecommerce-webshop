// ✅ useAdminProducts.ts
import { useQuery, useMutation, Reference } from '@apollo/client';
import { useState, useEffect } from 'react';
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

type ProductFilter = {
  name?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
};

type PaginatedProducts = {
  products: {
    items: Product[];
    total: number;
    page: number;
    totalPages: number;
  };
};

type UseAdminProductsResult = {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  productsLoading: boolean;
  modal: ModalState;
  setModal: React.Dispatch<React.SetStateAction<ModalState>>;
  handleDeleteProduct: (id: string) => void;
  deleteLoading: boolean;
  handleAddProduct: () => void;
  setPage: (page: number) => void;
  setSort: (sort: { field: string; order: 1 | -1 }) => void;
  // Controlled filter inputs:
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  categoryId: string;
  setCategoryId: React.Dispatch<React.SetStateAction<string>>;
  minPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
};

export function useAdminProducts(): UseAdminProductsResult {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [sort, setSort] = useState<{ field: string; order: 1 | -1 }>({
    field: 'createdAt',
    order: -1,
  });

  // Controlled filter inputs
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setFilter({
      name: search || undefined,
      categoryId: categoryId || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }, [search, categoryId, minPrice, maxPrice]);

  const { data, loading, refetch } = useQuery<PaginatedProducts>(GET_PRODUCTS, {
    variables: { page, limit, filter, sort },
    fetchPolicy: 'cache-and-network',
  });

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
            products(existingRefs = {}, { readField }) {
              const updatedItems = existingRefs.items?.filter(
                (ref: Reference) => readField('id', ref) !== modal.productId
              );
              return { ...existingRefs, items: updatedItems };
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
            await refetch();
            toast.success('Product deleted successfully!');
          } else {
            toast.error('Failed to delete product.');
          }
        } catch (err) {
          toast.error('An error occurred while deleting.');
          console.error(err);
        } finally {
          setModal((prev) => ({ ...prev, show: false }));
        }
      },
    });
  };

  return {
    products: data?.products.items || [],
    total: data?.products.total || 0,
    page,
    totalPages: data?.products.totalPages || 1,
    productsLoading: loading,
    modal,
    setModal,
    deleteLoading,
    handleDeleteProduct,
    handleAddProduct,
    setPage,
    setSort,
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
  };
}
