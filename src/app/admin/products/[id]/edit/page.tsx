'use client';
import { useParams } from 'next/navigation';
import EditProductForm from '@/components/admin/EditProductForm';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Edit Product</h1>
      <EditProductForm productId={id} />
    </div>
  );
}
