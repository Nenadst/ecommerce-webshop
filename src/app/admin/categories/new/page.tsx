'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { gql, Reference, useMutation } from '@apollo/client';
import { CREATE_CATEGORY } from '@/shared/graphql/category';
import toast from 'react-hot-toast';

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');

  const [createCategory, { loading }] = useMutation(CREATE_CATEGORY, {
    update(cache, { data }) {
      if (!data?.createCategory) return;

      const newRef = cache.writeFragment<Reference>({
        data: data.createCategory,
        fragment: gql`
          fragment NewCategory on Category {
            id
            name
          }
        `,
      });

      cache.modify({
        fields: {
          categories(existingRefs: readonly Reference[] = []) {
            return [...existingRefs, newRef].filter((ref): ref is Reference => Boolean(ref));
          },
        },
      });
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        await createCategory({ variables: { input: { name } } });
        toast.success('Category created!');
        router.push('/admin/categories');
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Something went wrong');
      }
    },
    [name, createCategory, router]
  );

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
        <button type="submit" className="w-full bg-sky-900 text-white py-2 px-4 rounded">
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
}
