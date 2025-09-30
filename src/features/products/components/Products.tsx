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
    id: string;
    name: string;
  };
}

const Products = () => {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockSelected, setInStockSelected] = useState(false);
  const [outOfStockSelected, setOutOfStockSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
      setCurrentPage(1);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories]);

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      page: currentPage,
      limit: productsPerPage,
      filter: selectedCategories.length > 0 ? { categoryIds: selectedCategories } : {},
      sort: { field: sortField, order: sortOrder },
    },
    fetchPolicy: 'network-only',
  });

  const allProducts = data?.products?.items || [];
  const totalPages = data?.products?.totalPages || 1;
  const total = data?.products?.total || 0;

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
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    switch (value) {
      case 'price-asc':
        setSortField('price');
        setSortOrder(1);
        break;
      case 'price-desc':
        setSortField('price');
        setSortOrder(-1);
        break;
      case 'name-asc':
        setSortField('name');
        setSortOrder(1);
        break;
      case 'name-desc':
        setSortField('name');
        setSortOrder(-1);
        break;
      case 'newest':
        setSortField('createdAt');
        setSortOrder(-1);
        break;
      case 'oldest':
        setSortField('createdAt');
        setSortOrder(1);
        break;
      default:
        setSortField('createdAt');
        setSortOrder(-1);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
        <div className="flex-1 ml-8">
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-600">
              Showing {products.length} of {total} products
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-gray-700 font-medium">
                Sort by:
              </label>
              <select
                id="sort"
                onChange={handleSortChange}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <Spinner />
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">No products found</div>
            ) : (
              products.map((product: Product, index: number) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <Card className="w-full h-[440px] flex flex-col overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
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
          {!loading && allProducts.length > 0 && (
            <div className="relative flex items-center mt-8 mb-8">
              <div className="flex items-center gap-2">
                <label htmlFor="perPageBottom" className="text-gray-700 font-medium">
                  Show:
                </label>
                <select
                  id="perPageBottom"
                  value={productsPerPage}
                  onChange={handleProductsPerPageChange}
                  className="border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none bg-white bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.5em_1.5em]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  }}
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                  <option value="96">96</option>
                </select>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-sky-900 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <BannerPromotion />
    </>
  );
};

export default Products;
