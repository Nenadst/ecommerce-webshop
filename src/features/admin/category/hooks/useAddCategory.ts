'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef } from 'react';
import { gql, Reference, useMutation } from '@apollo/client';
import { CREATE_CATEGORY } from '@/entities/category/api/category.queries';
import toast from 'react-hot-toast';

export function useAddCategory() {
  const router = useRouter();
  const [name, setName] = useState('');
  const submittingRef = useRef(false);

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
      if (submittingRef.current) return;
      submittingRef.current = true;
      try {
        await createCategory({ variables: { input: { name } } });
        toast.success('Category created!');
        router.push('/admin/categories');
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Something went wrong');
        submittingRef.current = false;
      }
    },
    [name, createCategory, router]
  );

  return {
    name,
    setName,
    loading,
    handleSubmit,
    router,
  };
}
