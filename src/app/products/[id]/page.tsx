import { BreadCrumb } from '@/shared/components/layouts/BreadCrumb';
import Footer from '@/shared/components/layouts/Footer';
import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import ProductDetails from '@/features/products/components/ProductDetails';
import React from 'react';

const ProductDetail = () => {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <BreadCrumb />
      <ProductDetails />
      <Footer />
    </main>
  );
};

export default ProductDetail;
