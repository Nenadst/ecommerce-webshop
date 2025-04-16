'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const GET_CATEGORY = gql`
  query Category($id: ID!) {
    category(id: $id) {
      id
      name
    }
  }
`;

const GET_CATEGORIES = gql`
  query categories {
    categories {
      id
      name
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
    }
  }
`;

export default function EditCategoryForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { data } = useQuery(GET_CATEGORY, { variables: { id: categoryId } });
  const [name, setName] = useState('');
  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
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
    await updateCategory({
      variables: { id: categoryId, input: { name } },
    });
    router.push('/admin/categories');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-4">
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
