import { useQuery, useMutation, Reference } from '@apollo/client';
import { useState } from 'react';
import { DELETE_CATEGORY, GET_CATEGORIES } from '@/shared/graphql/category';
import { Category } from '@/entities/category/types/category.types';
import toast from 'react-hot-toast';

type ModalState = {
  show: boolean;
  message: string;
  onConfirm: () => void;
  categoryId?: string;
};

export function useAdminCategories() {
  const { data, loading, error } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  const [modal, setModal] = useState<ModalState>({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  const [deleteCategory, { loading: deleteLoading }] = useMutation(DELETE_CATEGORY, {
    update(cache, { data }) {
      if (data?.deleteCategory) {
        cache.modify({
          fields: {
            categories(existingRefs: readonly Reference[] = [], { readField }) {
              // Remove the deleted category from cache by id
              return existingRefs.filter(
                (ref: Reference) => readField('id', ref) !== modal.categoryId
              );
            },
          },
        });
      }
    },
  });

  const handleAddCategory = (routerPush: (url: string) => void) => {
    routerPush('/admin/categories/new');
  };

  const handleDeleteCategory = (id: string) => {
    setModal({
      show: true,
      message: 'Are you sure you want to delete this category?',
      categoryId: id,
      onConfirm: async () => {
        try {
          const { data } = await deleteCategory({ variables: { id } });
          if (data?.deleteCategory) {
            toast.success('Category deleted successfully!');
          } else {
            toast.error('Could not delete category. It may be used by a product.');
          }
        } catch (err) {
          console.error(err);
          toast.error('An error occurred while deleting the category.');
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
