import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import Footer from '@/shared/components/layouts/Footer';
import Homepage from '@/features/homepage';

export default function Home() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <Homepage />
      <Footer />
    </main>
  );
}
