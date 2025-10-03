'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { ChevronRightIcon } from '../icons';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export const BreadCrumb = () => {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter((path) => path);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      let label = path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (path === 'admin') {
        label = 'Admin';
      } else if (path === 'products' && index === 0) {
        label = 'Products';
      } else if (path === 'wishlist') {
        label = 'Wishlist';
      } else if (path === 'cart') {
        label = 'Shopping Cart';
      } else if (path === 'checkout') {
        label = 'Checkout';
      } else if (path === 'profile') {
        label = 'My Profile';
      }

      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav>
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={crumb.href} className="flex items-center ml-0">
                {index > 0 && (
                  <ChevronRightIcon className="mx-0 text-gray-400" width={16} height={16} />
                )}
                {isLast ? (
                  <span className="font-semibold text-sky-900 px-1 py-1.5 rounded-md">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-600 hover:text-sky-900 px-1 py-1.5 rounded-md transition-all duration-200 font-medium"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
