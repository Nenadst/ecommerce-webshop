import { BreadCrumb } from '@/shared/components/layouts/BreadCrumb';
import ProductDetails from '@/features/products/components/ProductDetails';
import React from 'react';

const ProductDetail = () => {
  return (
    <>
      <BreadCrumb />
      <ProductDetails />
    </>
  );
};

export default ProductDetail;
