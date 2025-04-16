'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Create New Product</h1>
      <ProductForm />
    </div>
  );
}
