'use client';

import { Card } from '@/shared/components/elements/Card';
import DotSlide from '@/shared/components/elements/DotSlide';
import Star from '@/shared/components/elements/Star';
import { ButtonLoveIcon } from '@/shared/components/icons';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

interface Product {
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

interface ProductProps {
  initialProducts: Product[];
}

const Product = ({ initialProducts }: ProductProps) => {
  const products = initialProducts;

  if (products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, 9);

  return (
    <div className="container mx-auto px-4">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mb-5 place-items-center">
        <>
          {displayProducts.map((product: Product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card className="w-full max-w-[320px] h-80 justify-center flex flex-wrap relative cursor-pointer hover:bg-slate-100">
                <div className="relative w-40 md:w-48 h-36 md:h-44 mt-7">
                  <Image
                    src={product.images?.[0] || '/assets/img/no-product.png'}
                    alt={product.name}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <ButtonLoveIcon />
                <div className="gap-2 flex flex-col absolute bottom-5 left-3">
                  <div className="text-sky-900 text-base md:text-lg font-medium">
                    {product.name}
                  </div>
                  <div className="text-neutral-600 text-base md:text-lg font-semibold">
                    €{product.price}
                  </div>
                  <Star count={5} />
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
