import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import Footer from '@/shared/components/layouts/Footer';
import Checkout from '@/features/checkout';

export default function CheckoutPage() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <Checkout />
      <Footer />
    </main>
  );
}
