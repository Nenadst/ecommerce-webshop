'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef } from 'react';
import { gql, Reference, useMutation } from '@apollo/client';
import { CREATE_CATEGORY } from '@/entities/category/api/category.queries';
import toast from 'react-hot-toast';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';

export function useAddCategory() {
  const router = useRouter();
  const [name, setName] = useState('');
  const submittingRef = useRef(false);
  const { trackActivity } = useActivityTracker();

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
        const result = await createCategory({ variables: { input: { name } } });
        toast.success('Category created!');

        // Track admin action
        trackActivity({
          action: 'ADMIN_ACTION',
          description: `Created category: ${name}`,
          metadata: {
            action: 'CREATE_CATEGORY',
            categoryId: result.data?.createCategory?.id,
            categoryName: name,
          },
        });

        router.push('/admin/categories');
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Something went wrong');
        submittingRef.current = false;
      }
    },
    [name, createCategory, router, trackActivity]
  );

  return {
    name,
    setName,
    loading,
    handleSubmit,
    router,
  };
}
