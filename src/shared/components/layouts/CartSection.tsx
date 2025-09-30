'use client';

import React from 'react';
import { CartIcon, HeartIcon, UserIcon } from '../icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../user/UserMenu';

const CartSection = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();

  return (
    <div className="ml-auto mr-24 h-10 hidden md:hidden lg:flex">
      {isAdmin && (
        <Link
          href="/admin"
          className="justify-center items-center flex text-white text-sm font-normal mr-4"
        >
          Admin Panel
        </Link>
      )}

      {!isAuthenticated && (
        <Link
          href={`/login?returnUrl=${encodeURIComponent(pathname)}`}
          className="w-28 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
        >
          <div className="justify-center items-center flex">
            <UserIcon />
          </div>
          <div className="text-white text-sm font-normal">Sign in</div>
        </Link>
      )}
      <div className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg">
        <div className="justify-center items-center flex">
          <HeartIcon />
          <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex-col justify-center items-center gap-2 inline-flex">
            <div className="text-white text-xs font-normal">0</div>
          </div>
        </div>
        <div className="text-white text-sm font-normal">Wishlist</div>
      </div>
      <div className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg">
        <div className="justify-center items-center flex">
          <CartIcon />
          <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex-col justify-center items-center gap-2 inline-flex">
            <div className="text-white text-xs font-normal">0</div>
          </div>
        </div>
        <div className="text-white text-sm font-normal">Cart</div>
      </div>
      {isAuthenticated && (
        <div className="ml-4 flex items-center relative z-[100]">
          <UserMenu />
        </div>
      )}
    </div>
  );
};

export default CartSection;
