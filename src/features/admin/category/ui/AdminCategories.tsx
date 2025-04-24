import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { Category } from '@/entities/category/types/category.types';
import { useAdminCategories } from '../hooks/useAdminCategories';
import FullScreenSpinner from '@/shared/components/spinner/FullScreenSpinner';

export function AdminCategories() {
  const {
    categories,
    loading,
    modal,
    setModal,
    handleAddCategory,
    handleDeleteCategory,
    deleteLoading,
  } = useAdminCategories();
  if (loading) return <FullScreenSpinner />;

  return (
    <div className="p-6 space-y-10">
      <ConfirmModal
        show={modal.show}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((prev) => ({ ...prev, show: false }))}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-sky-900">Categories</h2>
        <button
          onClick={() => handleAddCategory()}
          className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-800"
        >
          + Add New Category
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat: Category) => (
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
              disabled={deleteLoading}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
