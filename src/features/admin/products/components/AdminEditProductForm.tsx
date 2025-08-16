'use client';

import { useEditProductForm } from '@/features/admin/products/hooks/useEditProductForm';
import FullScreenSpinner from '@/shared/components/spinner/FullScreenSpinner';
import Spinner from '@/shared/components/spinner/Spinner';
import { X } from 'lucide-react';

export default function AdminEditProductForm() {
  const {
    form,
    categoriesData,
    fileInputRef,
    imagePreviewUrl,
    handleSubmit,
    handleImageClear,
    handleFileChange,
    handleChange,
    productLoading,
    categoriesLoading,
    updateLoading,
    router,
  } = useEditProductForm();

  if (productLoading || categoriesLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 text-sky-900 font-medium relative group"
      >
        <span className="after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-900 after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left pb-1">
          ← Back
        </span>
      </button>
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={handleChange('name')}
          required
          autoFocus
        />
        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={handleChange('description')}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={handleChange('price')}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          className="w-full border p-2 rounded"
          value={form.quantity}
          onChange={handleChange('quantity')}
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
              onClick={handleImageClear}
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
          onChange={handleChange('categoryId')}
          required
        >
          <option value="">Select Category</option>
          {categoriesData?.categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-200"
            disabled={updateLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full bg-sky-900 text-white py-2 px-4 rounded flex items-center justify-center"
            disabled={updateLoading}
          >
            {updateLoading && <Spinner className="mr-2 text-white" />}
            {updateLoading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
