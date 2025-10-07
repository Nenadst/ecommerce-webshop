'use client';

import React from 'react';
import { CartIcon, HeartIcon, UserIcon } from '../icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../user/UserMenu';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../contexts/CartContext';
import { useCartDrawer } from '../../contexts/CartDrawerContext';
import { Package } from 'lucide-react';

const CartSection = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const { favorites, mounted } = useFavorites();
  const { itemCount, mounted: cartMounted } = useCart();
  const { openDrawer } = useCartDrawer();

  return (
    <div className="ml-auto mr-24 h-10 hidden md:hidden lg:flex">
      {isAdmin && (
        <Link
          href="/admin"
          className="w-32 h-10 justify-center items-center flex text-white text-sm font-normal mr-4 hover:bg-amber-600 cursor-pointer rounded-lg"
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
      <Link
        href="/wishlist"
        className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
      >
        <div className="justify-center items-center flex">
          <HeartIcon />
          <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex-col justify-center items-center gap-2 inline-flex">
            <div className="text-white text-xs font-normal">{mounted ? favorites.length : 0}</div>
          </div>
        </div>
        <div className="text-white text-sm font-normal">Wishlist</div>
      </Link>
      {isAuthenticated && (
        <Link
          href="/profile?tab=orders"
          className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
        >
          <div className="justify-center items-center flex">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="text-white text-sm font-normal">Orders</div>
        </Link>
      )}
      <button
        onClick={openDrawer}
        className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
      >
        <div className="justify-center items-center flex">
          <CartIcon />
          <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex-col justify-center items-center gap-2 inline-flex">
            <div className="text-white text-xs font-normal">{cartMounted ? itemCount : 0}</div>
          </div>
        </div>
        <div className="text-white text-sm font-normal">Cart</div>
      </button>
      {isAuthenticated && (
        <div className="ml-4 flex items-center relative z-[100]">
          <UserMenu />
        </div>
      )}
    </div>
  );
};

export default CartSection;
