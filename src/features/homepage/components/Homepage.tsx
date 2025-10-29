import React from 'react';
import Slider from './Slider';
import Category from './Category';
import PopularProduct from './PopularProduct';
import Product from './Product';
import BannerPromotion from './BannerPromotion';
import TopSeller from './TopSeller';
import Features from './Features';
import Testimoni from './Testimoni';
import Partner from './Partner';

interface ProductType {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category: {
    id: string;
    name: string;
  };
}

interface HomepageProps {
  initialProducts: ProductType[];
}

const Homepage = ({ initialProducts }: HomepageProps) => {
  return (
    <>
      <Slider />
      <Category />
      <PopularProduct />
      <Product initialProducts={initialProducts} />
      <BannerPromotion />
      <TopSeller />
      <Features />
      <Testimoni />
      <Partner />
    </>
  );
};

export default Homepage;
