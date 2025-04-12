import HeaderBottom from '@/components/layouts/HeaderBottom';
import HeaderTop from '@/components/layouts/HeaderTop';
import Footer from '@/components/layouts/Footer';
import { Broadcum } from '@/components/layouts/Broadcrum';
import Products from '@/features/products';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <main className="bg-white">
        <HeaderTop />
        <HeaderBottom />
        <Broadcum />
        <Products />
        <Footer />
      </main>
    </ProtectedRoute>
  );
}
