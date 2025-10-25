import React from 'react';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import Footer from '@/shared/components/layouts/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      {children}
      <Footer />
    </main>
  );
}
