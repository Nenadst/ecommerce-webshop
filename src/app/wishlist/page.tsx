import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import Footer from '@/shared/components/layouts/Footer';
import Wishlist from '@/features/wishlist';

export default function WishlistPage() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <Wishlist />
      <Footer />
    </main>
  );
}
