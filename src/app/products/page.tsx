import { Suspense } from 'react';
import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import Footer from '@/shared/components/layouts/Footer';
import { BreadCrumb } from '@/shared/components/layouts/BreadCrumb';
import Products from '@/features/products';
import Spinner from '@/shared/components/spinner/Spinner';

export default function CategoriesPage() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
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
      <Footer />
    </main>
  );
}
