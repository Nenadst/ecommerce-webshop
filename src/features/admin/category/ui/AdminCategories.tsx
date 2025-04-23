import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { AdminCategoriesUIProps, Category } from '@/entities/category/types/category.types';

export function AdminCategories({
  categories,
  loading,
  error,
  modal,
  setModal,
  handleAddCategory,
  handleDeleteCategory,
  deleteLoading,
  routerPush,
}: AdminCategoriesUIProps) {
  if (loading) return <p className="p-6">Loading categories...</p>;
  if (error) return <p className="p-6 text-red-600">Failed to load categories.</p>;

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
          onClick={() => handleAddCategory(routerPush)}
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
              {deleteLoading && cat.id === modal.categoryId ? (
                <span className="animate-spin w-4 h-4 border-b-2 border-red-600 rounded-full block"></span>
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
