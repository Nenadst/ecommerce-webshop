'use client';
import { useAdminCategories } from '@/features/admin/category/hooks/useAminCategories';
import { AdminCategories } from '@/features/admin/category/ui/AdminCategories';
import { useRouter } from 'next/navigation';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const adminCategories = useAdminCategories();

  return <AdminCategories {...adminCategories} routerPush={router.push} />;
}
