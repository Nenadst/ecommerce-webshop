import React from 'react';
import Image from 'next/image';
import SearchSection from './SearchSection';
import Link from 'next/link';
import CartSection from '@/shared/components/layouts/CartSection';
import Navigation from '@/shared/components/layouts/Navigation';

const HeaderBottom = () => {
  return (
    <>
      <div className="w-full h-16 bg-sky-900 items-center gap-20 inline-flex sticky top-0 z-[60]">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/img/logo.png"
            alt="WebShop Logo"
            width={120}
            height={40}
            className="ml-16"
            priority
          />
        </Link>
        <SearchSection />
        <CartSection />
      </div>
      <Navigation />
    </>
  );
};

export default HeaderBottom;
