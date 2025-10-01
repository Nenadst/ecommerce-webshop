import Link from 'next/link';
import React from 'react';
import { ChevronDownIcon } from '../icons';
import { CategoriesDropdown } from '../navigation/CategoriesDropdown';

const Navigation = () => {
  return (
    <div className="w-full h-16 bg-zinc-100 sticky top-16 z-50 hidden lg:block">
      <div className="flex justify-between">
        <div className="flex flex-wrap">
          <CategoriesDropdown className="ml-16" />
          <div className="mr-20" />
          <Link
            href="/"
            className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 group"
          >
            <div className="text-slate-500 font-semibold text-base group-hover:text-white">
              Home
            </div>
            <ChevronDownIcon />
          </Link>
          <Link
            href="/products"
            className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group"
          >
            <div className="text-slate-500 font-semibold text-base group-hover:text-white">
              Catalog
            </div>
            <ChevronDownIcon />
          </Link>
          <Link
            href="/wishlist"
            className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group"
          >
            <div className="text-slate-500 font-semibold text-base group-hover:text-white">
              Wishlist
            </div>
          </Link>
          <div className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group">
            <div className="text-slate-500 font-semibold text-base group-hover:text-white">
              Blog
            </div>
          </div>
          <div className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group">
            <div className="text-slate-500 font-semibold text-base group-hover:text-white">
              Pages
            </div>
            <ChevronDownIcon />
          </div>
          <div className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group">
            <div className="text-slate-500 font-semibold text-base group-hover:text-white">
              About us
            </div>
          </div>
        </div>
        <div className="font-semibold items-center flex mr-16 text-sky-800">
          <a href="">30 Days Free Return</a>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
