import { BreadCrumb } from '@/components/layouts/BreadCrumb';
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
      <BreadCrumb />
      <ProductDetails />
      <Footer />
    </main>
  );
};

export default ProductDetail;
