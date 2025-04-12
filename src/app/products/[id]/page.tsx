import { Broadcum } from '@/components/layouts/Broadcrum';
import Footer from '@/components/layouts/Footer';
import HeaderBottom from '@/components/layouts/HeaderBottom';
import HeaderTop from '@/components/layouts/HeaderTop';
import ProductDetails from '@/features/products/components/ProductDetails';
import React from 'react';

const ProductDetail = () => {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <Broadcum />
      <ProductDetails />
      <Footer />
    </main>
  );
};

export default ProductDetail;
