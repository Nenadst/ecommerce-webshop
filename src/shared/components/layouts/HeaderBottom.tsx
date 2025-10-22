import React from 'react';
import SearchSection from './SearchSection';
import CartSection from '@/shared/components/layouts/CartSection';
import Navigation from '@/shared/components/layouts/Navigation';
import Image from 'next/image';
import Link from 'next/link';

const HeaderBottom = () => {
  return (
    <div className="sticky top-0 z-[60] w-full">
      <div className="w-full h-22 py-1 bg-sky-900 flex items-center gap-20 px-16">
        <Link href="/" className="cursor-pointer flex items-center group">
          <Image
            src="/assets/img/logo.png"
            alt="WebShop Logo"
            width={110}
            height={50}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>
        <SearchSection />
        <CartSection />
      </div>
      <Navigation />
    </div>
  );
};

export default HeaderBottom;
