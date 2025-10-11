'use client';

import React, { createContext, useContext } from 'react';
import { useCartInternal as useCartHook } from '../hooks/useCart';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images?: string[];
    quantity: number;
    category?: { name: string };
  } | null;
}

interface CartContextType {
  cartItems: CartItem[];
  total: number;
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  mounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartHook();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
