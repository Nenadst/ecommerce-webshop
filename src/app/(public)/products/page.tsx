import { Suspense } from 'react';
import { BreadCrumb } from '@/shared/components/layouts/BreadCrumb';
import Products from '@/features/products';
import Spinner from '@/shared/components/spinner/Spinner';

export default function CategoriesPage() {
  return (
    <>
      <BreadCrumb />
      <Suspense
        fallback={
          <div className="w-full flex justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <Products />
      </Suspense>
    </>
  );
}
