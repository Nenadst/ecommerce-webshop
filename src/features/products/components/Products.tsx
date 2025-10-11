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
import { useCart } from '@/shared/contexts/CartContext';
import { useCartDrawer } from '@/shared/contexts/CartDrawerContext';
import Button from '@/shared/components/elements/Button';
import toast from 'react-hot-toast';

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
  const [inStockSelected, setInStockSelected] = useState(true);
  const [outOfStockSelected, setOutOfStockSelected] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, cartItems } = useCart();
  const { openDrawer } = useCartDrawer();

  const getAvailableQuantity = (productId: string, stockQuantity: number) => {
    const quantityInCart = cartItems.find((item) => item.productId === productId)?.quantity || 0;
    return stockQuantity - quantityInCart;
  };

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
      setCurrentPage(1);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, inStockSelected, outOfStockSelected]);

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: selectedCategories.length > 0 ? { categoryIds: selectedCategories } : {},
      sort: { field: sortField, order: sortOrder },
    },
    fetchPolicy: 'network-only',
  });

  const allProducts = data?.products?.items || [];

  const filteredProducts = allProducts.filter((product: Product) => {
    if (!inStockSelected && !outOfStockSelected) return true;
    if (inStockSelected && outOfStockSelected) return true;
    if (inStockSelected && product.quantity > 0) return true;
    if (outOfStockSelected && product.quantity === 0) return true;
    return false;
  });

  const filteredTotal = filteredProducts.length;
  const totalPages = Math.ceil(filteredTotal / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const products = filteredProducts.slice(startIndex, endIndex);

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

  const getSelectedQuantity = (productId: string): number => {
    return quantities[productId] || 1;
  };

  const updateQuantity = (productId: string, delta: number, availableStock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(availableStock, current + delta));
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const availableQty = getAvailableQuantity(product.id, product.quantity);

    if (availableQty === 0) {
      toast.error('All available stock is already in your cart');
      return;
    }

    const selectedQty = getSelectedQuantity(product.id);

    if (selectedQty > availableQty) {
      toast.error(`Only ${availableQty} more item(s) can be added to cart`);
      return;
    }

    setAddingToCart(product.id);
    try {
      await addToCart(product.id, selectedQty);
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
      openDrawer();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <>
      <div className="mx-auto min-h-full container mt-2 p-16 flex md:p-4">
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
            selectedCategories={selectedCategories}
          />
        </div>
        <div className="flex-1 ml-8">
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-600">
              Showing {products.length} of {filteredTotal} products
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
              products.map((product: Product, index: number) => {
                const availableQty = getAvailableQuantity(product.id, product.quantity);
                return (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <Card className="w-full h-[500px] flex flex-col overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
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
                        {availableQty > 0 ? (
                          <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                            {availableQty} Available
                          </span>
                        ) : product.quantity > 0 ? (
                          <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                            All in Cart
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
                        <div className="flex items-center justify-between mt-auto mb-3">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-sky-900">
                              €{product.price}
                            </span>
                          </div>
                          <Star count={5} />
                        </div>

                        <div
                          className="mb-2 flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <span className="text-sm text-gray-700 font-medium">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(product.id, -1, availableQty);
                              }}
                              disabled={availableQty === 0 || getSelectedQuantity(product.id) <= 1}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="w-10 text-center font-bold text-gray-900">
                              {availableQty === 0 ? 0 : getSelectedQuantity(product.id)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(product.id, 1, availableQty);
                              }}
                              disabled={
                                availableQty === 0 ||
                                getSelectedQuantity(product.id) >= availableQty
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Button
                            onClick={(e) => e && handleAddToCart(e, product)}
                            disabled={availableQty === 0 || addingToCart === product.id}
                            className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                              availableQty > 0
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            } disabled:opacity-50`}
                          >
                            {addingToCart === product.id
                              ? 'Adding...'
                              : availableQty > 0
                                ? 'Add to Cart'
                                : product.quantity > 0
                                  ? 'All in Cart'
                                  : 'Out of Stock'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })
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
