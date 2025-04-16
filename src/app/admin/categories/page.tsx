'use client';
import { useRouter } from 'next/navigation';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Category } from './types';

const GET_CATEGORIES = gql`
  query categories {
    categories {
      id
      name
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { data, refetch } = useQuery(GET_CATEGORIES);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [modal, setModal] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  const handleAddCategory = () => {
    router.push('/admin/categories/new');
  };

  const handleDeleteCategory = (id: string) => {
    setModal({
      show: true,
      message: 'Are you sure you want to delete this category?',
      onConfirm: async () => {
        await deleteCategory({ variables: { id } });
        await refetch();
      },
    });
  };

  return (
    <div className="p-6 space-y-10">
      <ConfirmModal
        show={modal.show}
        message={modal.message}
        onConfirm={() => {
          modal.onConfirm();
          setModal((prev) => ({ ...prev, show: false }));
        }}
        onCancel={() => setModal((prev) => ({ ...prev, show: false }))}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-sky-900">Categories</h2>
        <button
          onClick={handleAddCategory}
          className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-800"
        >
          + Add New Category
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {data?.categories?.map((cat: Category) => (
          <div
            key={cat.id}
            className="flex items-center bg-sky-100 text-sky-900 px-3 py-1 rounded-full text-sm font-medium"
          >
            <span>{cat.name}</span>
            <Link
              href={`/admin/categories/${cat.id}/edit`}
              className="ml-2 text-blue-600 hover:underline text-xs"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="ml-2 text-sky-900 hover:text-red-600"
              aria-label="Delete category"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
