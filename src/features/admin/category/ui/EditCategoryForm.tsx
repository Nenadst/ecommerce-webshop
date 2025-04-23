'use client';

import { CategoryData, UpdateCategoryData } from '@/entities/category/types/category.types';
import { GET_CATEGORIES, GET_CATEGORY, UPDATE_CATEGORY } from '@/shared/graphql/category';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function EditCategoryForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { data, loading: loadingCategory } = useQuery<CategoryData>(GET_CATEGORY, {
    variables: { id: categoryId },
  });
  const [name, setName] = useState('');
  const [updateCategory] = useMutation<UpdateCategoryData>(UPDATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (data?.category?.name) {
      setName(data.category.name);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    await updateCategory({ variables: { id: categoryId, input: { name } } });
    router.push('/admin/categories');
  };

  if (loadingCategory) return <div className="p-6">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="text"
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <button type="submit" className="w-full bg-sky-900 text-white py-2 px-4 rounded">
        Update Category
      </button>
    </form>
  );
}
