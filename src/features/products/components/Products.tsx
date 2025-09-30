'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import SideCategories from './SideCategories';
import { Separator } from '@/shared/components/elements/Separator';
import SideAvaliability from './SideAvaliability';
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
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockSelected, setInStockSelected] = useState(false);
  const [outOfStockSelected, setOutOfStockSelected] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
    }
  }, [categoryFromUrl]);

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 100,
      filter: selectedCategories.length > 0 ? { categoryIds: selectedCategories } : {},
      sort: { field: 'createdAt', order: -1 },
    },
    fetchPolicy: 'network-only',
  });

  const allProducts = data?.products?.items || [];

  const products = allProducts.filter((product: Product) => {
    if (!inStockSelected && !outOfStockSelected) return true;
    if (inStockSelected && outOfStockSelected) return true;
    if (inStockSelected && product.quantity > 0) return true;
    if (outOfStockSelected && product.quantity === 0) return true;
    return false;
  });

  const handleAvailabilityChange = (inStock: boolean, outOfStock: boolean) => {
    setInStockSelected(inStock);
    setOutOfStockSelected(outOfStock);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(productId);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <div className="mx-auto min-h-full container mt-20 p-16 flex md:p-4">
        <div className="w-[300px] h-full hidden lg:block">
          <SideCategories
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />
          <Separator />
          <SideAvaliability
            inStockSelected={inStockSelected}
            outOfStockSelected={outOfStockSelected}
            onAvailabilityChange={handleAvailabilityChange}
          />
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
                <Card className="w-80 h-[440px] flex flex-col overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <Image
                      src={product.image || '/assets/img/no-product.png'}
                      alt={product.name}
                      width={256}
                      height={256}
                      className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300"
                      priority={index < 4}
                    />
                    <button
                      onClick={(e) => handleToggleFavorite(e, product.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md z-10"
                      aria-label={
                        isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'
                      }
                    >
                      <HeartIconBig
                        className={`w-5 h-5 transition-colors ${
                          isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                        }`}
                      />
                    </button>
                    <span className="absolute top-3 left-3 bg-sky-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {product.category.name}
                    </span>
                    {product.quantity > 0 ? (
                      <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sky-900 text-lg font-semibold mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                      {product.description
                        ? truncateText(product.description, 80)
                        : 'No description available'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-sky-900">€{product.price}</span>
                      </div>
                      <Star count={5} />
                    </div>
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
