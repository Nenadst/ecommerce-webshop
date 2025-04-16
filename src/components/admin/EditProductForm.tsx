'use client';

import { Product } from '@/app/admin/products/types';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EditProduct } from './types';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

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

  const [form, setForm] = useState<EditProduct>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: '',
    categoryId: '',
    file: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        file: null,
      });
    }
  }, [data]);

  const imagePreviewUrl = useMemo(() => {
    return form.file ? URL.createObjectURL(form.file) : '';
  }, [form.file]);

  const handleUpload = async (): Promise<string> => {
    const formData = new FormData();
    if (form.file) {
      formData.append('file', form.file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = form.image;

    if (form.file) {
      imageUrl = await handleUpload();
    } else if (!form.image) {
      imageUrl = '';
    }

    await updateProduct({
      variables: {
        id: productId,
        input: {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          image: imageUrl,
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
      {form.file ? (
        <div className="relative">
          <img
            src={imagePreviewUrl}
            alt="New Preview"
            className="w-full max-h-40 object-contain rounded bg-gray-100"
          />
          <button
            type="button"
            title="Remove image"
            onClick={() => setForm((f) => ({ ...f, file: null, image: '' }))}
            className="absolute top-2 right-2 w-7 h-7 bg-white text-red-600 rounded-full flex items-center justify-center shadow hover:bg-red-100 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : form.image ? (
        <div className="relative">
          <img
            src={form.image}
            alt="Current Image"
            className="w-full max-h-40 object-contain rounded bg-gray-100"
          />
          <button
            type="button"
            title="Remove image"
            onClick={() => setForm((f) => ({ ...f, file: null, image: '' }))}
            className="absolute top-2 right-2 w-7 h-7 bg-white text-red-600 rounded-full flex items-center justify-center shadow hover:bg-red-100 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      {/* Upload new image */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="w-full border p-2 rounded"
        onChange={(e) => {
          const selected = e.target.files?.[0];

          if (selected && selected.size > 2 * 1024 * 1024) {
            toast.error('Image must be smaller than 2MB');

            setForm((f) => ({ ...f, file: null }));

            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }

            return;
          }

          setForm((f) => ({ ...f, file: selected || null }));
        }}
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
