'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import SideCategories from './SideCategories';
import { Separator } from '@/shared/components/elements/Separator';
import SideAvaliability from './SideAvaliability';
import SideProductType from './SideProductType';
import SideColor from './SideColor';
import { Card } from '@/shared/components/elements/Card';
import Star from '@/shared/components/elements/Star';
import BannerPromotion from '@/features/homepage/components/BannerPromotion';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';
import Spinner from '@/shared/components/spinner/Spinner';
import { HeartIconBig } from '@/shared/components/icons';
import { useFavorites } from '@/shared/hooks/useFavorites';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  category: {
    name: string;
  };
}

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 100,
      filter: selectedCategory ? { categoryId: selectedCategory } : {},
      sort: { field: 'createdAt', order: -1 },
    },
  });

  const products = data?.products?.items || [];

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(productId);
  };

  return (
    <>
      <div className="mx-auto min-h-full container mt-20 p-16 flex md:p-4">
        <div className="w-[300px] h-full hidden lg:block">
          <SideCategories
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <Separator />
          <SideAvaliability />
          <Separator />
          <SideProductType />
          <Separator />
          <SideColor />
        </div>
        <div className="max-w-full ml-8 flex flex-wrap gap-5">
          {loading ? (
            <div className="w-full flex justify-center py-20">
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            <div className="w-full text-center py-20 text-gray-500">No products found</div>
          ) : (
            products.map((product: Product, index: number) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="w-80 h-80 justify-center flex relative cursor-pointer hover:bg-slate-100">
                  <Image
                    src={product.image || '/assets/img/no-product.png'}
                    alt={product.name}
                    width={192}
                    height={176}
                    className="mt-7 rounded-lg object-contain"
                    priority={index < 4}
                  />
                  <button
                    onClick={(e) => handleToggleFavorite(e, product.id)}
                    className="w-10 h-10 absolute top-2 right-2 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
                    aria-label={
                      isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'
                    }
                  >
                    <HeartIconBig
                      className={`w-6 h-6 transition-colors ${
                        isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <div className="gap-2 flex flex-col absolute bottom-5 left-3">
                    <div className="text-sky-900 text-lg font-medium">{product.name}</div>
                    <div className="text-neutral-600 text-lg font-semibold">€{product.price}</div>
                    <Star count={5} />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
      <BannerPromotion />
    </>
  );
};

export default Products;
