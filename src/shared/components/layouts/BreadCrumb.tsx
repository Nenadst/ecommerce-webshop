import Link from 'next/link';
import React from 'react';
import { ChevronRightIcon } from '../icons';

export const BreadCrumb = () => {
  return (
    <div className="max-w-full h-12 flex gap-3 ml-16 items-center">
      <Link href="/">Home</Link>
      <ChevronRightIcon />
      <Link href="/products">All category</Link>
      <ChevronRightIcon />
    </div>
  );
};
