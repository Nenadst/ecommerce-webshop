import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import Footer from '@/shared/components/layouts/Footer';
import Cart from '@/features/cart';

export default function CartPage() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <Cart />
      <Footer />
    </main>
  );
}
