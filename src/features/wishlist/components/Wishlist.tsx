'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { Card } from '@/shared/components/elements/Card';
import Star from '@/shared/components/elements/Star';
import { HeartIconBig } from '@/shared/components/icons';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { useCart } from '@/shared/hooks/useCart';
import Spinner from '@/shared/components/spinner/Spinner';
import Button from '@/shared/components/elements/Button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useCartDrawer } from '@/shared/contexts/CartDrawerContext';
import toast from 'react-hot-toast';

const GET_FAVORITE_PRODUCTS = gql`
  query GetFavoriteProducts {
    favoriteProducts {
      id
      name
      description
      price
      quantity
      images
      category {
        id
        name
      }
    }
  }
`;

const GET_PRODUCTS_BY_IDS = gql`
  query GetProducts($page: Int, $limit: Int, $filter: ProductFilterInput, $sort: ProductSortInput) {
    products(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id
        name
        description
        price
        quantity
        images
        category {
          id
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  images?: string[];
  category: {
    id: string;
    name: string;
  };
}

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart, cartItems } = useCart();
  const { openDrawer } = useCartDrawer();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const getCartQuantity = (productId: string): number => {
    const cartItem = cartItems.find(
      (item: { id: string; productId: string; quantity: number; product?: { id: string } }) =>
        item.productId === productId || item.product?.id === productId
    );
    return cartItem?.quantity || 0;
  };

  const getSelectedQuantity = (productId: string): number => {
    return quantities[productId] || 1;
  };

  const updateQuantity = (productId: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: newQty };
    });
  };

  const { data: authData, loading: authLoading } = useQuery(GET_FAVORITE_PRODUCTS, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const { data: guestData, loading: guestLoading } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: {},
      sort: { field: 'createdAt', order: -1 },
    },
    skip: isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const loading = isAuthenticated ? authLoading : guestLoading;

  const products: Product[] = isAuthenticated
    ? authData?.favoriteProducts || []
    : (guestData?.products?.items || []).filter((p: Product) => favorites.includes(p.id));

  const displayProducts = hasLocalChanges ? localProducts : products;

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const current = hasLocalChanges ? localProducts : products;
    const updated = current.filter((p) => p.id !== productId);

    setLocalProducts(updated);
    setHasLocalChanges(true);

    await toggleFavorite(productId);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.quantity === 0) {
      toast.error('This product is out of stock');
      return;
    }

    const selectedQty = getSelectedQuantity(product.id);

    if (selectedQty > product.quantity) {
      toast.error(`Only ${product.quantity} items available in stock`);
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

  const handleAddAllToCart = async () => {
    const inStockProducts = displayProducts.filter((p: Product) => p.quantity > 0);

    if (inStockProducts.length === 0) {
      toast.error('No products in stock to add');
      return;
    }

    setAddingToCart('all');
    let successCount = 0;
    let failCount = 0;

    for (const product of inStockProducts) {
      try {
        await addToCart(product.id, 1);
        successCount++;
      } catch (error) {
        console.error(`Failed to add ${product.name} to cart:`, error);
        failCount++;
      }
    }

    setAddingToCart(null);

    if (successCount > 0) {
      openDrawer();
    }
    if (failCount > 0) {
      toast.error(`Failed to add ${failCount} ${failCount === 1 ? 'item' : 'items'}`);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
      <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">My Wishlist</h1>
            <p className="text-xl text-sky-100">
              {displayProducts.length > 0
                ? `You have ${displayProducts.length} ${displayProducts.length === 1 ? 'item' : 'items'} in your wishlist`
                : 'Start adding your favorite products'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mb-6">
                <HeartIconBig className="w-24 h-24 text-sky-400" />
              </div>
              <h2 className="text-3xl font-bold text-sky-900 mb-4">Your Wishlist is Empty</h2>
              <p className="text-gray-600 text-lg mb-8">
                Discover amazing products and add them to your wishlist by clicking the heart icon
              </p>
            </div>
            <Link href="/products">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="grid grid-cols-3 gap-6 flex-1">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-sky-900">{displayProducts.length}</div>
                    <div className="text-gray-600">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {displayProducts.filter((p) => p.quantity > 0).length}
                    </div>
                    <div className="text-gray-600">In Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-sky-900">
                      €{displayProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                    </div>
                    <div className="text-gray-600">Total Value</div>
                  </div>
                </div>
                <Button
                  onClick={handleAddAllToCart}
                  disabled={
                    addingToCart === 'all' ||
                    displayProducts.filter((p) => p.quantity > 0).length === 0
                  }
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 text-base font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {addingToCart === 'all' ? 'Adding All...' : 'Add All to Cart'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product: Product, index: number) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <Card className="w-full h-[500px] flex flex-col overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-all duration-300 group border-2 border-transparent hover:border-amber-500">
                    <div className="relative h-64 bg-gradient-to-br from-gray-50 to-sky-50 flex items-center justify-center overflow-hidden">
                      <Image
                        src={product.images?.[0] || '/assets/img/no-product.png'}
                        alt={product.name}
                        width={256}
                        height={256}
                        className="object-contain w-full h-full p-4 group-hover:scale-110 transition-transform duration-300"
                        priority={index < 4}
                      />
                      <button
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-lg z-10"
                        aria-label="Remove from favorites"
                      >
                        <HeartIconBig className="w-5 h-5 fill-red-500 text-red-500 transition-colors" />
                      </button>
                      <span className="absolute top-3 left-3 bg-sky-900 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                        {product.category.name}
                      </span>
                      {product.quantity > 0 ? (
                        <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                          In Stock
                        </span>
                      ) : (
                        <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow bg-white">
                      <h3 className="text-sky-900 text-lg font-semibold mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description
                          ? truncateText(product.description, 80)
                          : 'No description available'}
                      </p>
                      <div className="flex items-center justify-between mb-2 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-sky-900">€{product.price}</span>
                        </div>
                        <Star count={5} />
                      </div>
                      {getCartQuantity(product.id) > 0 && (
                        <div className="mb-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-sky-900 font-medium">In Cart:</span>
                          <span className="text-sm font-bold text-sky-900">
                            {getCartQuantity(product.id)}{' '}
                            {getCartQuantity(product.id) === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      )}
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="mb-2 flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 font-medium">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(product.id, -1, product.quantity);
                            }}
                            disabled={
                              product.quantity === 0 || getSelectedQuantity(product.id) <= 1
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
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="w-10 text-center font-bold text-gray-900">
                            {product.quantity === 0 ? 0 : getSelectedQuantity(product.id)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(product.id, 1, product.quantity);
                            }}
                            disabled={
                              product.quantity === 0 ||
                              getSelectedQuantity(product.id) >= product.quantity
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
                      <Button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.quantity === 0 || addingToCart === product.id}
                        className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                          product.quantity > 0
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } disabled:opacity-50`}
                      >
                        {addingToCart === product.id
                          ? 'Adding...'
                          : product.quantity > 0
                            ? 'Add to Cart'
                            : 'Out of Stock'}
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center bg-gradient-to-r from-sky-900 to-cyan-700 rounded-lg p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-3">Ready to shop?</h3>
              <p className="text-sky-100 mb-6">
                Add these items to your cart and complete your purchase
              </p>
              <Link href="/products">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
