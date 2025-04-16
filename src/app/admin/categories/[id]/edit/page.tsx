'use client';
import { useParams } from 'next/navigation';
import EditCategoryForm from '@/components/admin/EditCategoryForm';

export default function EditCategoryPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Edit Category</h1>
      <EditCategoryForm categoryId={id} />
    </div>
  );
}
