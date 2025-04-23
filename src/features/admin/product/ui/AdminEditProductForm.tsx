'use client';

import { useMutation, useQuery, Reference, StoreObject } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { GET_PRODUCT, UPDATE_PRODUCT } from '@/shared/graphql/product';
import { GET_CATEGORIES } from '@/shared/graphql/category';
import { Product } from '@/entities/product/types/product.types';
import { Category } from '@/entities/category/types/category.types';
import { EditProduct } from '@/entities/product/types/edit-product.types';

export default function EditProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { data: productData } = useQuery<{ product: Product }>(GET_PRODUCT, {
    variables: { id: productId },
  });
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    update(cache, { data }) {
      if (!data?.updateProduct) return;

      cache.modify({
        fields: {
          products(existingProducts: readonly (Reference | StoreObject)[] = [], { readField }) {
            return existingProducts.map((prod) =>
              readField('id', prod) === data.updateProduct.id
                ? { ...prod, ...data.updateProduct }
                : prod
            );
          },
        },
      });
    },
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
    if (productData?.product) {
      const product = productData.product;
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        image: product.image || '',
        categoryId: product.category?.id || '',
        file: null,
      });
    }
  }, [productData]);

  const imagePreviewUrl = useMemo(() => {
    return form.file ? URL.createObjectURL(form.file) : '';
  }, [form.file]);

  const handleUpload = async (): Promise<string> => {
    if (!form.file) return '';

    try {
      const formData = new FormData();
      formData.append('file', form.file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url;
    } catch (err) {
      toast.error('Image upload failed');
      console.log(err);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = form.image;

    if (form.file) {
      imageUrl = await handleUpload();
    } else if (!form.image) {
      imageUrl = '';
    }

    try {
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
      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    }
  };

  const handleImageClear = () => {
    setForm((f) => ({ ...f, file: null, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      handleImageClear();
      return;
    }
    setForm((f) => ({ ...f, file: selected || null }));
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
            onClick={handleImageClear}
            className="absolute top-2 right-2 w-7 h-7 bg-white text-red-600 rounded-full flex items-center justify-center shadow hover:bg-red-100"
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
        onChange={handleFileChange}
      />
      <select
        className="w-full border p-2 rounded"
        value={form.categoryId}
        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        required
      >
        <option value="">Select Category</option>
        {categoriesData?.categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <button type="submit" className="w-full bg-sky-900 text-white py-2 px-4 rounded">
        Update Product
      </button>
    </form>
  );
}
