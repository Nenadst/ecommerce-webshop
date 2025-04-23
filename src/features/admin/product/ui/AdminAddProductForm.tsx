'use client';

import { useQuery } from '@apollo/client';
import { Category } from '@/entities/category/types/category.types';
import { X } from 'lucide-react';
import { GET_CATEGORIES } from '@/shared/graphql/category';
import { useAddProductForm } from '../hooks/useAddProductForm';

export default function AddProductForm() {
  const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  const {
    form,
    fileInputRef,
    handleFileChange,
    handleImageClear,
    handleInputChange,
    handleSubmit,
    loading,
  } = useAddProductForm();

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={handleInputChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={handleInputChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={handleInputChange}
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          className="w-full border p-2 rounded"
          value={form.quantity}
          onChange={handleInputChange}
          required
        />

        <select
          name="categoryId"
          className="w-full border p-2 rounded"
          value={form.categoryId}
          onChange={handleInputChange}
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
              onClick={handleImageClear}
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
          onChange={handleFileChange}
        />

        <button
          type="submit"
          className="w-full bg-sky-900 text-white font-semibold py-2 px-4 rounded hover:bg-sky-800"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
