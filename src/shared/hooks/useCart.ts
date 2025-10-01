import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useAuth } from '../contexts/AuthContext';

const GET_CART = gql`
  query GetCart {
    cart {
      items {
        id
        productId
        quantity
        product {
          id
          name
          price
          image
          quantity
          category {
            id
            name
          }
        }
      }
      total
      itemCount
    }
  }
`;

const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($productId: ID!, $quantity: Int) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      productId
      quantity
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId)
  }
`;

const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UpdateCartItemQuantity($productId: ID!, $quantity: Int!) {
    updateCartItemQuantity(productId: $productId, quantity: $quantity) {
      id
      productId
      quantity
    }
  }
`;

const CLEAR_CART_MUTATION = gql`
  mutation ClearCart {
    clearCart
  }
`;

const LOCAL_STORAGE_KEY = 'guest_cart';

interface CartItem {
  productId: string;
  quantity: number;
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const { data, refetch, loading } = useQuery(GET_CART, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const [addToCartMutation] = useMutation(ADD_TO_CART_MUTATION);
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART_MUTATION);
  const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM_MUTATION);
  const [clearCartMutation] = useMutation(CLEAR_CART_MUTATION);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setLocalCart(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse cart:', error);
          setLocalCart([]);
        }
      }
    }
  }, [isAuthenticated]);

  const cartItems = isAuthenticated ? data?.cart?.items || [] : localCart;
  const total = isAuthenticated ? data?.cart?.total || 0 : 0;
  const itemCount = isAuthenticated
    ? data?.cart?.itemCount || 0
    : localCart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = async (productId: string, quantity: number = 1): Promise<void> => {
    if (isAuthenticated) {
      try {
        await addToCartMutation({ variables: { productId, quantity } });
        await refetch();
      } catch (error) {
        console.error('Failed to add to cart:', error);
        throw error;
      }
    } else {
      setLocalCart((prev) => {
        const existingItem = prev.find((item) => item.productId === productId);
        let newCart;
        if (existingItem) {
          newCart = prev.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          newCart = [...prev, { productId, quantity }];
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const removeFromCart = async (productId: string): Promise<void> => {
    if (isAuthenticated) {
      try {
        await removeFromCartMutation({ variables: { productId } });
        await refetch();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        throw error;
      }
    } else {
      setLocalCart((prev) => {
        const newCart = prev.filter((item) => item.productId !== productId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<void> => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (isAuthenticated) {
      try {
        await updateCartItemMutation({ variables: { productId, quantity } });
        await refetch();
      } catch (error) {
        console.error('Failed to update cart item:', error);
        throw error;
      }
    } else {
      setLocalCart((prev) => {
        const newCart = prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const clearCart = async (): Promise<void> => {
    if (isAuthenticated) {
      try {
        await clearCartMutation();
        await refetch();
      } catch (error) {
        console.error('Failed to clear cart:', error);
        throw error;
      }
    } else {
      setLocalCart([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return {
    cartItems,
    total,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading,
    mounted,
  };
}
