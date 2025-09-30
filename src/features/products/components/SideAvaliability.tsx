'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';

interface SideAvailabilityProps {
  inStockSelected: boolean;
  outOfStockSelected: boolean;
  onAvailabilityChange: (inStock: boolean, outOfStock: boolean) => void;
}

const SideAvaliability = ({
  inStockSelected,
  outOfStockSelected,
  onAvailabilityChange,
}: SideAvailabilityProps) => {
  const { data } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: {},
      sort: { field: 'createdAt', order: -1 },
    },
  });

  const allProducts = data?.products?.items || [];
  const inStockCount = allProducts.filter((p: { quantity: number }) => p.quantity > 0).length;
  const outOfStockCount = allProducts.filter((p: { quantity: number }) => p.quantity === 0).length;

  const handleInStockChange = () => {
    onAvailabilityChange(!inStockSelected, outOfStockSelected);
  };

  const handleOutOfStockChange = () => {
    onAvailabilityChange(inStockSelected, !outOfStockSelected);
  };

  const handleReset = () => {
    onAvailabilityChange(false, false);
  };

  return (
    <>
      <div className="flex justify-between mb-3">
        <div className="text-sky-900 font-semibold">Availability</div>
        <button onClick={handleReset} className="text-sky-900 text-sm hover:underline">
          Reset
        </button>
      </div>
      <div className="flex justify-between items-center mb-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            id="ins"
            type="checkbox"
            checked={inStockSelected}
            onChange={handleInStockChange}
            className="h-6 w-6 rounded-md bg-slate-400 checked:bg-slate-700 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="ins" className="ml-0 text-gray-800 cursor-pointer">
            In stock
          </label>
        </label>
        <div className="text-sky-900">({inStockCount})</div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            id="oos"
            type="checkbox"
            checked={outOfStockSelected}
            onChange={handleOutOfStockChange}
            className="h-6 w-6 rounded-md bg-slate-400 checked:bg-slate-700 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="oos" className="ml-0 text-gray-800 cursor-pointer">
            Out of stock
          </label>
        </label>
        <div className="text-sky-900">({outOfStockCount})</div>
      </div>
    </>
  );
};

export default SideAvaliability;
