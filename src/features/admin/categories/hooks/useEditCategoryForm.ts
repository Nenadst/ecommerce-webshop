import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  GET_CATEGORIES,
  GET_CATEGORY,
  UPDATE_CATEGORY,
} from '@/entities/category/api/category.queries';
import { CategoryData, UpdateCategoryData } from '@/entities/category/types/category.types';

export function useEditCategoryForm() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;
  const { data } = useQuery<CategoryData>(GET_CATEGORY, {
    variables: { id: categoryId },
  });

  const [name, setName] = useState('');
  const submittingRef = useRef(false);

  const [updateCategory, { loading: loadingCategory }] = useMutation<UpdateCategoryData>(
    UPDATE_CATEGORY,
    {
      refetchQueries: [{ query: GET_CATEGORIES }],
      awaitRefetchQueries: true,
    }
  );

  useEffect(() => {
    if (data?.category?.name) {
      setName(data.category.name);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submittingRef.current) return;
    submittingRef.current = true;

    if (!name.trim()) {
      toast.error('Name is required');
      submittingRef.current = false;
      return;
    }
    try {
      await updateCategory({ variables: { id: categoryId, input: { name } } });
      router.push('/admin/categories');
    } catch (err) {
      if (err instanceof ApolloError) {
        console.log('GraphQL Error:', err);
        if (err.graphQLErrors) {
          err.graphQLErrors.forEach((error) => {
            if (error.extensions?.code === 'DUPLICATE_CATEGORY') {
              toast.error('Category name already exists');
            } else {
              toast.error(error.message);
            }
          });
        }
      } else {
        toast.error('An error occurred');
        console.error(err);
      }
    } finally {
      submittingRef.current = false;
    }
  };

  return {
    name,
    setName,
    handleSubmit,
    loadingCategory,
    router,
  };
}
