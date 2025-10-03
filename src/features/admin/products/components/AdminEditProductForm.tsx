'use client';

import { useEditProductForm } from '@/features/admin/products/hooks/useEditProductForm';
import FullScreenSpinner from '@/shared/components/spinner/FullScreenSpinner';
import Spinner from '@/shared/components/spinner/Spinner';
import { X, GripVertical, Star } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageItemProps {
  id: string;
  preview: string;
  index: number;
  isMain: boolean;
  onRemove: (index: number) => void;
}

function SortableImageItem({ id, preview, index, isMain, onRemove }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white rounded border">
      <div className="relative">
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className="h-24 w-full object-cover rounded"
        />
        {isMain && (
          <div className="absolute top-1 left-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Star size={12} fill="white" />
            <span className="font-semibold">Main</span>
          </div>
        )}
        <button
          type="button"
          title="Remove image"
          onClick={() => onRemove(index)}
          className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
        <div
          {...attributes}
          {...listeners}
          className="absolute bottom-1 right-1 w-6 h-6 bg-white/90 rounded flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={16} className="text-gray-600" />
        </div>
      </div>
      <div className="text-xs text-center py-1 text-gray-600">
        {isMain ? 'Main Image' : `Image ${index + 1}`}
      </div>
    </div>
  );
}

export default function AdminEditProductForm() {
  const {
    form,
    categoriesData,
    fileInputRef,
    handleSubmit,
    handleFileChange,
    handleExistingImageRemove,
    handleNewImageRemove,
    handleAllImagesReorder,
    handleInputChange,
    productLoading,
    categoriesLoading,
    updateLoading,
    router,
  } = useEditProductForm();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (productLoading || categoriesLoading) {
    return <FullScreenSpinner />;
  }

  const allImages = [...form.existingImages, ...form.imagePreviews];
  const totalImages = allImages.length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = allImages.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = allImages.findIndex((_, i) => `image-${i}` === over.id);
      handleAllImagesReorder(oldIndex, newIndex);
    }
  };

  const handleImageRemove = (index: number) => {
    if (index < form.existingImages.length) {
      handleExistingImageRemove(index);
    } else {
      handleNewImageRemove(index - form.existingImages.length);
    }
  };

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
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter product name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={handleInputChange}
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter product description"
            className="w-full border p-2 rounded"
            rows={3}
            value={form.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            name="price"
            placeholder="0.00"
            className="w-full border p-2 rounded"
            value={form.price}
            onChange={handleInputChange}
            required
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="hasDiscount"
              checked={form.hasDiscount}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Has Discount</span>
          </label>

          {form.hasDiscount && (
            <div>
              <label
                htmlFor="discountPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Discount Price
              </label>
              <input
                id="discountPrice"
                type="number"
                name="discountPrice"
                placeholder="0.00"
                className="w-full border p-2 rounded"
                value={form.discountPrice}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            type="number"
            name="quantity"
            placeholder="0"
            className="w-full border p-2 rounded"
            value={form.quantity}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            className="w-full border p-2 rounded"
            value={form.categoryId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {categoriesData?.categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Product Images (Max 8, 2MB each)</label>
            <p className="text-xs text-gray-500">{totalImages}/8 images</p>
          </div>

          {totalImages > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                First image is the main product image. Drag to reorder.
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={allImages.map((_, i) => `image-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.map((preview, index) => (
                      <SortableImageItem
                        key={`image-${index}`}
                        id={`image-${index}`}
                        preview={preview}
                        index={index}
                        isMain={index === 0}
                        onRemove={handleImageRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="w-full border p-2 rounded"
            onChange={handleFileChange}
            disabled={totalImages >= 8}
          />
        </div>

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
            className="w-full bg-sky-900 text-white font-semibold py-2 px-4 rounded hover:bg-sky-800 flex items-center justify-center gap-2"
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
