import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import Footer from '@/shared/components/layouts/Footer';
import { BreadCrumb } from '@/shared/components/layouts/BreadCrumb';
import Products from '@/features/products';

export default function CategoriesPage() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <BreadCrumb />
      <Products />
      <Footer />
    </main>
  );
}
