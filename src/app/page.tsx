import HeaderBottom from '@/components/layouts/HeaderBottom';
import HeaderTop from '@/components/layouts/HeaderTop';
import Footer from '@/components/layouts/Footer';
import Homepage from '@/features/homepage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="bg-white">
        <HeaderTop />
        <HeaderBottom />
        <Homepage />
        <Footer />
      </main>
    </ProtectedRoute>
  );
}
