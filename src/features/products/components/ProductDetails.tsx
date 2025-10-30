'use client';

import { Card } from '@/shared/components/elements/Card';
import { Separator } from '@/shared/components/elements/Separator';
import Star from '@/shared/components/elements/Star';
import { HeartIconBig } from '@/shared/components/icons';
import Image from 'next/image';
import React, { useState } from 'react';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { useCart } from '@/shared/contexts/CartContext';
import { useCartDrawer } from '@/shared/contexts/CartDrawerContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { AuthModal } from '@/shared/components/modals/AuthModal';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT } from '@/entities/product/api/product.queries';

const ProductDetails = () => {
  const params = useParams();
  const productId = params.id as string;

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
    skip: !productId,
  });

  const product = data?.product;

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, cartItems } = useCart();
  const { openDrawer } = useCartDrawer();
  const { isAuthenticated } = useAuth();
  const { trackActivity } = useActivityTracker();

  const quantityInCart = product
    ? cartItems.find((item) => item.productId === product.id)?.quantity || 0
    : 0;
  const availableQuantity = product ? product.quantity - quantityInCart : 0;

  React.useEffect(() => {
    if (product) {
      trackActivity({
        action: 'VIEW_PRODUCT',
        description: `Viewed product: ${product.name}`,
        metadata: {
          productId: product.id,
          productName: product.name,
          price: product.price,
        },
      });
    }
  }, [product?.id, product?.name, product?.price, trackActivity]);

  React.useEffect(() => {
    if (selectedQuantity > availableQuantity && availableQuantity > 0) {
      setSelectedQuantity(availableQuantity);
    } else if (availableQuantity === 0) {
      setSelectedQuantity(0);
    }
  }, [availableQuantity, selectedQuantity]);

  if (loading) {
    return (
      <div className="container mx-auto py-14">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-14">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600">Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0 ? product.images : ['/assets/img/no-product.png'];

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(availableQuantity, selectedQuantity + delta));
    setSelectedQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (availableQuantity === 0) {
      toast.error('All available stock is already in your cart');
      return;
    }

    if (selectedQuantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} more item(s) can be added to cart`);
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedQuantity);
      setSelectedQuantity(1);
      openDrawer();
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    await toggleFavorite(product.id);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <div className="container mx-auto">
        <div className="min-h-full flex flex-col lg:flex-row py-14">
          <div className="w-full lg:w-[50%] h-full flex flex-col gap-4 px-4">
            <div className="w-full max-w-[500px] mx-auto">
              <div
                className="w-full aspect-square relative overflow-hidden bg-gray-50 cursor-zoom-in rounded-lg border border-gray-200"
                onClick={openFullscreen}
              >
                <Image
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain p-8 pointer-events-none"
                  priority
                />
              </div>
            </div>
            {images.length > 1 && (
              <div className="w-full max-w-[500px] mx-auto grid grid-cols-4 gap-3">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all bg-gray-50 ${
                      selectedImageIndex === index
                        ? 'border-sky-900 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-full lg:w-[50%] h-full lg:h-auto lg:flex lg:ml-5">
            <div className="w-[500px] h-full lg:h-auto lg:w-full flex-col gap-2 flex mt-10 lg:mt-0 m-auto">
              <div className="flex-col gap-2.5 flex">
                <div className="text-sky-900 font-semibold text-2xl">{product.name}</div>
                <div className="flex items-center gap-3">
                  {product.hasDiscount && product.discountPrice ? (
                    <>
                      <span className="text-neutral-600 text-2xl font-semibold">
                        €{product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-lg line-through">
                        €{product.price.toFixed(2)}
                      </span>
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {Math.round(
                          ((product.price - product.discountPrice) / product.price) * 100
                        )}
                        % OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-600 text-2xl font-semibold">
                      €{product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="justify-normal gap-2.5 flex">
                <Star count={5} />
                <div className="text-neutral-600 text-sm font-medium">No reviews</div>
              </div>
              <div className="gap-5 flex">
                <div className="text-neutral-800 text-lg font-medium">Availability:</div>
                <div className="gap-3.5 flex">
                  {availableQuantity > 0 ? (
                    <div className="text-green-500 text-lg font-medium">
                      {availableQuantity} available
                      {quantityInCart > 0 ? ` (${quantityInCart} in cart)` : ''}
                    </div>
                  ) : product.quantity > 0 ? (
                    <div className="text-orange-600 text-lg font-medium">All in cart</div>
                  ) : (
                    <div className="text-red-500 text-lg font-medium">Out of stock</div>
                  )}
                </div>
              </div>
              {availableQuantity > 0 && availableQuantity <= 10 && (
                <div className="text-orange-600 text-base font-medium">
                  Hurry up! only {availableQuantity} product{availableQuantity > 1 ? 's' : ''} left
                  available!
                </div>
              )}
              <Separator />
              {product.description && (
                <>
                  <div className="text-gray-700 text-base">{product.description}</div>
                  <Separator />
                </>
              )}
              <div className="flex items-center">
                <span className="font-semibold">Quantity:</span>
                <div className="flex gap-0 ml-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={availableQuantity === 0 || selectedQuantity <= 1}
                    className="w-10 h-8 bg-zinc-100 border items-center justify-center flex disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={availableQuantity === 0 ? 0 : selectedQuantity}
                    readOnly
                    className="w-14 h-8 bg-zinc-100 border border-slate-200 focus:ring-0 focus:border-slate-200 text-center"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={availableQuantity === 0 || selectedQuantity >= availableQuantity}
                    className="w-10 h-8 bg-zinc-100 border items-center justify-center flex disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleAddToCart}
                  disabled={availableQuantity === 0 || addingToCart}
                  className={`w-56 h-16 text-white text-lg font-medium rounded-full transition-all ${
                    availableQuantity > 0
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-gray-300 cursor-not-allowed'
                  } disabled:opacity-50`}
                >
                  {addingToCart
                    ? 'Adding...'
                    : availableQuantity > 0
                      ? 'Add to cart'
                      : product.quantity > 0
                        ? 'All in cart'
                        : 'Out of stock'}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="w-16 h-16 bg-zinc-100 rounded-full justify-center items-center flex hover:bg-amber-100 group transition-colors"
                >
                  <div className="w-9 h-9 justify-center items-center flex">
                    <div className="w-9 h-9 relative">
                      <HeartIconBig
                        className={`transition-colors ${
                          isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              </div>
              <Separator />
              <div className="flex items-center">
                <div className="font-semibold">SKU:</div>
                <span className="ml-3">{product.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex items-center">
                <div className="font-semibold">Category:</div>
                <div className="flex ml-3 gap-2">
                  <Link
                    href={`/products?category=${product.category.id}`}
                    className="text-sky-900 hover:underline"
                  >
                    {product.category.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isFullscreen && (
          <div
            className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center"
            onClick={closeFullscreen}
          >
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-[10000]"
              aria-label="Close fullscreen"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3"
                  aria-label="Previous image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            <div
              className="relative max-w-7xl max-h-[90vh] w-full h-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-5 w-full h-full p-5 justify-center items-center">
          <button className="w-36 h-12 rounded-2xl border border-slate-400 font-semibold">
            Description
          </button>
          <button className="w-36 h-12 rounded-2xl border border-slate-400 bg-sky-900 font-semibold text-white">
            Reviews
          </button>
        </div>
        <div className="p-5 flex justify-center items-center m-auto">
          <Card className="w-[85%] h-42 p-8 flex flex-col gap-3">
            <span className="font-semibold text-sky-900">Customer reviews</span>
            <span className="text-slate-500">No reviews yet</span>
            <button className="bg-sky-900 text-white w-36 h-10 underline">Write a review</button>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
