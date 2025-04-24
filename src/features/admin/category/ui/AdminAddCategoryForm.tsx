'use client';

import Spinner from '@/shared/components/spinner/Spinner';
import { useAddCategory } from '../hooks/useAddCategory';

export function AdminAddCategoryForm() {
  const { name, setName, loading, handleSubmit, router } = useAddCategory();

  return (
    <div className="p-6 max-w-md">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 text-sky-900 font-medium relative group"
      >
        <span className="after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-900 after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left pb-1">
          ← Back
        </span>
      </button>
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Create New Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-sky-900 text-white py-2 px-4 rounded flex items-center justify-center"
          disabled={loading}
        >
          {loading && <Spinner className="mr-2 text-white" />}
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
}
