'use client';

import { Product } from '@/app/admin/products/types';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const GET_PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      quantity
      image
      category {
        id
      }
    }
  }
`;

const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      price
      quantity
      image
      category {
        id
        name
      }
    }
  }
`;

export default function EditProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { data } = useQuery(GET_PRODUCT, { variables: { id: productId } });
  const { data: catData } = useQuery(GET_CATEGORIES);

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: ['products'],
    awaitRefetchQueries: true,
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: '',
    categoryId: '',
  });

  useEffect(() => {
    if (data?.product) {
      const p = data.product;
      setForm({
        name: p.name,
        description: p.description || '',
        price: p.price.toString(),
        quantity: p.quantity.toString(),
        image: p.image || '',
        categoryId: p.category?.id || '',
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProduct({
      variables: {
        id: productId,
        input: {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          image: form.image,
          categoryId: form.categoryId,
        },
      },
    });
    router.push('/admin/products');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="text"
        placeholder="Name"
        className="w-full border p-2 rounded"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        className="w-full border p-2 rounded"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        className="w-full border p-2 rounded"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        className="w-full border p-2 rounded"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Image URL"
        className="w-full border p-2 rounded"
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
      />
      <select
        className="w-full border p-2 rounded"
        value={form.categoryId}
        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        required
      >
        <option value="">Select Category</option>
        {catData?.categories?.map((cat: Product) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <button type="submit" className="w-full bg-sky-900 text-white py-2 px-4 rounded">
        Update Product
      </button>
    </form>
  );
}
