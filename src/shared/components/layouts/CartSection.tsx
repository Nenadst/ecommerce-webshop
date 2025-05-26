'use client';

import React from 'react';
import { CartIcon, HeartIcon, UserIcon } from '../icons';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { useLogout } from '@/shared/hooks/useLogout';

const ME_QUERY = gql`
  query Me {
    me {
      _id
      email
    }
  }
`;

const CartSection = () => {
  const { data, loading: meLoading } = useQuery(ME_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const isLoggedIn = Boolean(data?.me);

  const { logoutMutation, logoutLoading } = useLogout();

  const handleLogout = () => {
    logoutMutation();
  };

  return (
    <div className="ml-auto mr-24 h-10 hidden md:hidden lg:flex">
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
      {meLoading ? null : isLoggedIn ? (
        <>
          <Link
            href="/admin"
            className="w-32 h-10 justify-center items-center flex text-white text-sm font-normal mr-3 hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            Admin Panel
          </Link>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-32 h-10 text-white text-sm font-normal hover:bg-amber-600 cursor-pointer rounded-lg"
          >
            {logoutLoading ? 'Logging out…' : 'Logout'}
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="w-32 h-10 justify-center items-center gap-3 flex hover:bg-amber-600 cursor-pointer rounded-lg"
        >
          <div className="justify-center items-center flex">
            <UserIcon />
          </div>
          <div className="text-white text-sm font-normal">Sign in</div>
        </Link>
      )}
    </div>
  );
};

export default CartSection;
