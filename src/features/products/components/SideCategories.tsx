'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '@/entities/category/api/category.queries';

interface Category {
  id: string;
  name: string;
}

interface SideCategoriesProps {
  selectedCategory?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
}

const SideCategories = ({ selectedCategory, onCategoryChange }: SideCategoriesProps) => {
  const { data, loading } = useQuery(GET_CATEGORIES);

  const categories = data?.categories || [];

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      onCategoryChange(undefined);
    } else {
      onCategoryChange(categoryId);
    }
  };

  const handleReset = () => {
    onCategoryChange(undefined);
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
            className="h-6 w-6 rounded-md bg-slate-400 checked:bg-slate-700 focus:ring-0"
            checked={!selectedCategory}
            onChange={() => onCategoryChange(undefined)}
          />
          <label htmlFor="allCategories" className="ml-0 text-gray-800 cursor-pointer">
            All Categories
          </label>
        </label>
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
                className="h-6 w-6 rounded-md bg-slate-400 checked:bg-slate-700 focus:ring-0"
                checked={selectedCategory === category.id}
                onChange={() => handleCategoryClick(category.id)}
              />
              <label htmlFor={category.id} className="ml-0 text-gray-800 cursor-pointer">
                {category.name}
              </label>
            </label>
          </div>
        ))
      )}
    </div>
  );
};

export default SideCategories;
