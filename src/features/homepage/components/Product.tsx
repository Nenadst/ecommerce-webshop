import Button from '@/shared/components/elements/Button';
import { Card } from '@/shared/components/elements/Card';
import DotSlide from '@/shared/components/elements/DotSlide';
import Star from '@/shared/components/elements/Star';
import { ButtonLoveIcon, EyeIcon, ShoppingCartIcon } from '@/shared/components/icons';
import { PRODUCTS } from '@/data/products';
import Link from 'next/link';
import React from 'react';

export type MockProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  featured: boolean;
};

const featuredProducts = PRODUCTS.filter((product) => product.featured);
const nonFeaturedProducts = PRODUCTS.filter((product) => !product.featured);

const randomNonFeaturedProducts = nonFeaturedProducts.sort(() => 0.5 - Math.random()).slice(0, 7);

const Product = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mb-5 place-items-center">
        <>
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="w-full max-w-[320px] h-80 justify-center gap-6 md:gap-9 flex flex-wrap relative"
            >
              <img
                className="w-40 md:w-48 h-36 md:h-44 mt-7 rounded-lg"
                src={product.image}
                alt={product.name}
              />
              <ButtonLoveIcon />
              <div className="flex justify-between gap-2 md:gap-5 mb-4 px-2">
                <Button className="flex-1 min-w-0 h-12 md:h-14 pl-3 md:pl-6 pr-2 justify-between flex items-center bg-blue-300 hover:bg-blue-400 text-slate-800 text-sm md:text-base font-semibold">
                  <span className="truncate">Add to cart</span>
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-amber-500 rounded-full justify-center items-center flex ml-2">
                    <ShoppingCartIcon />
                  </div>
                </Button>
                <Link href={`/products/${product.id}`}>
                  <Button className="w-12 md:w-16 h-12 md:h-14 bg-blue-300 justify-center flex items-center hover:bg-blue-400">
                    <EyeIcon />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
          {randomNonFeaturedProducts.map((product: MockProduct) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card
                key={product.id}
                className="w-full max-w-[320px] h-80 justify-center flex flex-wrap relative cursor-pointer hover:bg-slate-100"
              >
                <img
                  className="w-40 md:w-48 h-36 md:h-44 mt-7 rounded-lg"
                  src={product.image}
                  alt={product.name}
                />
                <ButtonLoveIcon />
                <div className="gap-2 flex flex-col absolute bottom-5 left-3">
                  <div className="text-sky-900 text-base md:text-lg font-medium">
                    {product.name}
                  </div>
                  <div className="text-neutral-600 text-base md:text-lg font-semibold">
                    ${product.price}
                  </div>
                  <Star count={product.rating} />
                </div>
              </Card>
            </Link>
          ))}
        </>
      </div>
      <DotSlide className="mx-auto mt-10" count={2} />
    </div>
  );
};

export default Product;
