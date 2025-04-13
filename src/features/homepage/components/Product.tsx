import Button from '@/components/elements/Button';
import { Card } from '@/components/elements/Card';
import DotSlide from '@/components/elements/DotSlide';
import Star from '@/components/elements/Star';
import { ButtonLoveIcon, EyeIcon, ShoppingCartIcon } from '@/components/icons';
import { PRODUCTS } from '@/data/products';
import { IProduct } from '@/types/products';
import Link from 'next/link';
import React from 'react';

const featuredProducts = PRODUCTS.filter((product) => product.featured);
const nonFeaturedProducts = PRODUCTS.filter((product) => !product.featured);

const randomNonFeaturedProducts = nonFeaturedProducts.sort(() => 0.5 - Math.random()).slice(0, 7);

const Product = () => {
  return (
    <div className="container mx-auto">
      <div className="w-full flex flex-wrap justify-center mb-5 gap-5">
        <>
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="w-80 h-80 justify-center gap-9 flex flex-wrap relative"
            >
              <img className="w-48 h-44 mt-7 rounded-lg" src={product.image} />
              <ButtonLoveIcon />
              <div className="flex justify-between gap-5 mb-4">
                <Button className="w-56 h-14 pl-6 justify-between flex items-center bg-blue-300 hover:bg-blue-400 text-slate-800 text-base font-semibold">
                  Add to cart
                  <div className="w-8 h-8 bg-amber-500 rounded-full justify-center items-center flex mr-4">
                    <ShoppingCartIcon />
                  </div>
                </Button>
                <Link href={`/products/${product.id}`}>
                  <Button className="w-16 h-14 bg-blue-300 justify-center flex items-center hover:bg-blue-400">
                    <EyeIcon />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
          {randomNonFeaturedProducts.map((product: IProduct) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card
                key={product.id}
                className="w-80 h-80 justify-center flex flex-wrap relative cursor-pointer hover:bg-slate-100"
              >
                <img className="w-48 h-44 mt-7 rounded-lg" src={product.image} />
                <ButtonLoveIcon />
                <div className="gap-2 flex flex-col absolute bottom-5 left-3">
                  <div className="text-sky-900 text-lg font-medium">{product.name}</div>
                  <div className="text-neutral-600 text-lg font-semibold">${product.price}</div>
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
