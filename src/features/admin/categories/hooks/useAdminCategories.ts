import { useQuery, useMutation, Reference } from '@apollo/client';
import { useState } from 'react';
import { DELETE_CATEGORY, GET_CATEGORIES } from '@/entities/category/api/category.queries';
import { Category } from '@/entities/category/types/category.types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';

type ModalState = {
  show: boolean;
  message: string;
  onConfirm: () => void;
  categoryId?: string;
};

export function useAdminCategories() {
  const router = useRouter();
  const { trackActivity } = useActivityTracker();
  const { data, loading, error } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  const [modal, setModal] = useState<ModalState>({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  const [deleteCategory, { loading: deleteLoading }] = useMutation(DELETE_CATEGORY);

  const handleAddCategory = () => {
    router.push('/admin/categories/new');
  };

  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = data?.categories?.find((c) => c.id === id);

    setModal({
      show: true,
      message: 'Are you sure you want to delete this category?',
      categoryId: id,
      onConfirm: async () => {
        try {
          const { data: deleteData } = await deleteCategory({
            variables: { id },
            update(cache, { data }) {
              if (data?.deleteCategory) {
                cache.modify({
                  fields: {
                    categories(existingRefs: readonly Reference[] = [], { readField }) {
                      return existingRefs.filter((ref: Reference) => readField('id', ref) !== id);
                    },
                  },
                });
              }
            },
          });
          if (deleteData?.deleteCategory) {
            toast.success('Category deleted successfully!');

            // Track admin action
            trackActivity({
              action: 'ADMIN_ACTION',
              description: `Deleted category: ${categoryToDelete?.name || 'Unknown'}`,
              metadata: {
                action: 'DELETE_CATEGORY',
                categoryId: id,
                categoryName: categoryToDelete?.name,
              },
            });
          } else {
            toast.error('Could not delete category. It may be used by a product.');
          }
        } catch (err: unknown) {
          console.error('Delete category error:', err);

          // Extract error message from GraphQL error
          const errorMessage =
            (err && typeof err === 'object' && 'graphQLErrors' in err
              ? (err as { graphQLErrors?: Array<{ message?: string }> }).graphQLErrors?.[0]?.message
              : undefined) ||
            (err instanceof Error ? err.message : undefined) ||
            'An error occurred while deleting the category.';
          toast.error(errorMessage);
        } finally {
          setModal((prev) => ({ ...prev, show: false }));
        }
      },
    });
  };

  return {
    categories: data?.categories ?? [],
    loading,
    error,
    modal,
    setModal,
    handleAddCategory,
    handleDeleteCategory,
    deleteLoading,
  };
}
