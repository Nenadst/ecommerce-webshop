'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { CategoriesDropdown } from '../navigation/CategoriesDropdown';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="w-full h-16 bg-zinc-100">
        <div className="flex justify-between items-center h-full">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-wrap">
            <CategoriesDropdown className="ml-16" />
            <div className="mr-20" />
            <Link
              href="/"
              className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 group"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                Home
              </div>
            </Link>
            <Link
              href="/catalog"
              className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                Catalog
              </div>
            </Link>
            <Link
              href="/blog"
              className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                Blog
              </div>
            </Link>
            <Link
              href="/about-us"
              className="w-32 h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                About us
              </div>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden ml-4 p-2 text-slate-500 hover:text-slate-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* 24/7 Support */}
          <div className="hidden lg:flex font-semibold items-center mr-16 text-sky-800">
            <p>24/7 Support</p>
          </div>
        </div>
      </div>

      {/* Mobile Full Screen Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[152px] bg-zinc-100 z-[70] overflow-y-auto">
          <div className="flex flex-col">
            <Link
              href="/products"
              onClick={toggleMobileMenu}
              className="w-full h-16 flex items-center justify-center hover:bg-amber-500 group border-b border-zinc-200"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                Browse categories
              </div>
            </Link>
            <Link
              href="/"
              onClick={toggleMobileMenu}
              className="w-full h-16 flex items-center justify-center hover:bg-amber-500 group border-b border-zinc-200"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                Home
              </div>
            </Link>
            <Link
              href="/catalog"
              onClick={toggleMobileMenu}
              className="w-full h-16 flex items-center justify-center hover:bg-amber-500 group border-b border-zinc-200"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                Catalog
              </div>
            </Link>
            <Link
              href="/blog"
              onClick={toggleMobileMenu}
              className="w-full h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group border-b border-zinc-200"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                Blog
              </div>
            </Link>
            <Link
              href="/about-us"
              onClick={toggleMobileMenu}
              className="w-full h-16 flex items-center justify-center hover:bg-amber-500 cursor-pointer group border-b border-zinc-200"
            >
              <div className="text-slate-500 font-semibold text-base group-hover:text-white">
                About us
              </div>
            </Link>
            <div className="w-full h-16 flex items-center justify-center border-b border-zinc-200">
              <div className="text-sky-800 font-semibold text-base">24/7 Support</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
