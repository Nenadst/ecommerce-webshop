'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createCategory] = useMutation(CREATE_CATEGORY, {
    update(cache, { data: { createCategory } }) {
      cache.modify({
        fields: {
          categories(existing = []) {
            return [...existing, createCategory];
          },
        },
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCategory({ variables: { input: { name } } });
      router.push('/admin/categories');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    }
  };

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
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-sky-900 text-white py-2 px-4 rounded">
          Create Category
        </button>
      </form>
    </div>
  );
}
