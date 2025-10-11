'use client';

import Button from '@/shared/components/elements/Button';
import React from 'react';

const PopularProduct = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="w-full lg:w-11/12 justify-between m-auto flex flex-col lg:flex-row items-center gap-4 lg:gap-0 mt-5 mb-5 p-4 md:p-10">
        <div className="text-cyan-800 text-2xl md:text-3xl font-semibold text-center lg:text-left">
          Popular products
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
          <Button
            onClick={() => {}}
            className="w-28 md:w-36 h-11 border border-sky-900 text-sky-900 text-sm md:text-base font-medium hover:bg-slate-200"
          >
            Cameras
          </Button>
          <Button
            onClick={() => {}}
            className="w-28 md:w-36 h-11 border border-sky-900 text-sky-900 text-sm md:text-base font-medium hover:bg-slate-200"
          >
            Laptops
          </Button>
          <Button
            onClick={() => {}}
            className="w-28 md:w-36 h-11 border border-sky-900 text-sky-900 text-sm md:text-base font-medium hover:bg-slate-200"
          >
            Tablets
          </Button>
          <Button
            onClick={() => {}}
            className="w-28 md:w-36 h-11 border border-sky-900 text-sky-900 text-sm md:text-base font-medium hover:bg-slate-200"
          >
            Mouse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PopularProduct;
