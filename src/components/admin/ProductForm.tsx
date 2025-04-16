'use client';

import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Category } from '@/app/admin/categories/types';

const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
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

export default function ProductForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    file: null as File | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    update(cache, { data: { createProduct } }) {
      cache.modify({
        fields: {
          products(existing = []) {
            return [...existing, createProduct];
          },
        },
      });
    },
  });

  const handleUpload = async (): Promise<string> => {
    const formData = new FormData();
    formData.append('file', form.file!);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      let imageUrl = '';
      if (form.file) {
        imageUrl = await handleUpload();
      }

      await createProduct({
        variables: {
          input: {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            quantity: parseInt(form.quantity),
            categoryId: form.categoryId,
            image: imageUrl,
          },
        },
      });

      setSuccess(true);
      setForm({ name: '', description: '', price: '', quantity: '', categoryId: '', file: null });
      router.push('/admin/products');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    }
  };

  return (
    <div>
      {success && <p className="text-green-600 mb-2">Product created successfully!</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Product Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          className="w-full border p-2 rounded"
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          required
        />

        <select
          className="w-full border p-2 rounded"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          required
        >
          <option value="">Select Category</option>
          {catData?.categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          className="w-full border p-2 rounded"
          onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
        />

        <button
          type="submit"
          className="w-full bg-sky-900 text-white font-semibold py-2 px-4 rounded hover:bg-sky-800"
        >
          Create Product
        </button>
      </form>
    </div>
  );
}
