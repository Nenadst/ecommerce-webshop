'use client';

import AddProductForm from '@/features/admin/product/ui/AdminAddProductForm';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();

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
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Create New Product</h1>
      <AddProductForm />
    </div>
  );
}
