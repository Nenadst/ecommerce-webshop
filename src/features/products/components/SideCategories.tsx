'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '@/entities/category/api/category.queries';
import { GET_PRODUCTS } from '@/entities/product/api/product.queries';

interface Category {
  id: string;
  name: string;
}

interface SideCategoriesProps {
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
}

const SideCategories = ({ selectedCategories, onCategoriesChange }: SideCategoriesProps) => {
  const { data, loading } = useQuery(GET_CATEGORIES);
  const { data: productsData } = useQuery(GET_PRODUCTS, {
    variables: {
      page: 1,
      limit: 1000,
      filter: {},
      sort: { field: 'createdAt', order: -1 },
    },
  });

  const categories = data?.categories || [];
  const allProducts = productsData?.products?.items || [];

  const getCategoryCount = (categoryId: string) => {
    return allProducts.filter((p: { category: { id: string } }) => p.category.id === categoryId)
      .length;
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleReset = () => {
    onCategoriesChange([]);
  };

  return (
    <div className="w-[300px]">
      <div className="flex justify-between mb-3">
        <div className="text-sky-900 font-semibold">Categories</div>
        <button onClick={handleReset} className="text-sky-900 text-sm hover:underline">
          Reset
        </button>
      </div>
      <div className="flex justify-between items-center mb-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            id="allCategories"
            type="checkbox"
            className="h-6 w-6 rounded-md bg-slate-400 checked:bg-slate-700 focus:ring-0 cursor-pointer"
            checked={selectedCategories.length === 0}
            onChange={() => onCategoriesChange([])}
          />
          <label htmlFor="allCategories" className="ml-0 text-gray-800 cursor-pointer">
            All Categories
          </label>
        </label>
        <div className="text-sky-900">({allProducts.length})</div>
      </div>
      {loading ? (
        <div className="text-gray-500 text-sm">Loading...</div>
      ) : (
        categories.map((category: Category) => (
          <div key={category.id} className="flex justify-between items-center mb-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                id={category.id}
                type="checkbox"
                className="h-6 w-6 rounded-md bg-slate-400 checked:bg-slate-700 focus:ring-0 cursor-pointer"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryClick(category.id)}
              />
              <label htmlFor={category.id} className="ml-0 text-gray-800 cursor-pointer">
                {category.name}
              </label>
            </label>
            <div className="text-sky-900">({getCategoryCount(category.id)})</div>
          </div>
        ))
      )}
    </div>
  );
};

export default SideCategories;
