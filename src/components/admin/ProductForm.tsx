'use client';

import { useRef, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Category } from '@/app/admin/categories/types';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

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
    imagePreview: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setForm({
        name: '',
        description: '',
        price: '',
        quantity: '',
        categoryId: '',
        file: null,
        imagePreview: '',
      });
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Something went wrong.');
      }
    }
  };

  return (
    <div>
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

        {form.imagePreview && (
          <div className="relative">
            <img
              src={form.imagePreview}
              alt="Preview"
              className="h-48 w-full object-contain rounded mb-2 bg-gray-100"
            />
            <button
              type="button"
              title="Remove image"
              onClick={() => {
                setForm((f) => ({ ...f, file: null, imagePreview: '' }));
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-white text-red-600 rounded-full flex items-center justify-center shadow hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="w-full border p-2 rounded"
          onChange={(e) => {
            const selected = e.target.files?.[0];

            if (selected && selected.size > 2 * 1024 * 1024) {
              toast.error('Image must be smaller than 2MB');

              // Clear form state
              setForm((f) => ({ ...f, file: null, imagePreview: '' }));

              // Clear file input field visibly
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }

              return;
            }

            // Update state if valid
            setForm((f) => ({
              ...f,
              file: selected || null,
              imagePreview: selected ? URL.createObjectURL(selected) : '',
            }));
          }}
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
