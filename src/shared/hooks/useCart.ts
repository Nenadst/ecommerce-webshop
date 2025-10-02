import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  category?: {
    id: string;
    name: string;
  };
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product | null;
}

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

const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [ID!]!) {
    productsByIds(ids: $ids) {
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
  const [isMigrating, setIsMigrating] = useState(false);
  const migrationAttempted = useRef(false);

  const { data, refetch, loading } = useQuery(GET_CART, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  // Fetch product details for guest cart items to calculate totals
  const productIds = useMemo(() => localCart.map((item) => item.productId), [localCart]);
  const { data: guestProductsData } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: { ids: productIds },
    skip: isAuthenticated || productIds.length === 0,
  });

  const [addToCartMutation] = useMutation(ADD_TO_CART_MUTATION);
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART_MUTATION);
  const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM_MUTATION);
  const [clearCartMutation] = useMutation(CLEAR_CART_MUTATION);

  // Load guest cart from localStorage on mount
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

  // Migrate guest cart to authenticated cart on login
  useEffect(() => {
    const migrateGuestCart = async () => {
      if (isAuthenticated && localCart.length > 0 && !migrationAttempted.current && !isMigrating) {
        migrationAttempted.current = true;
        setIsMigrating(true);

        try {
          for (const item of localCart) {
            try {
              await addToCartMutation({
                variables: { productId: item.productId, quantity: item.quantity },
              });
            } catch (error) {
              console.error(`Failed to migrate item ${item.productId}:`, error);
            }
          }

          // Clear local cart after successful migration
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setLocalCart([]);
          await refetch();
          toast.success('Cart items migrated successfully!');
        } catch (error) {
          console.error('Failed to migrate cart:', error);
          toast.error('Failed to migrate some cart items');
        } finally {
          setIsMigrating(false);
        }
      }
    };

    migrateGuestCart();
  }, [isAuthenticated, localCart, addToCartMutation, refetch, isMigrating]);

  // Reset migration flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      migrationAttempted.current = false;
    }
  }, [isAuthenticated]);

  // Calculate guest cart items with product details
  const guestCartItems = useMemo(() => {
    if (isAuthenticated || !guestProductsData?.productsByIds) return [];

    return localCart
      .map((cartItem) => {
        const product = guestProductsData.productsByIds.find(
          (p: Product) => p.id === cartItem.productId
        );
        return {
          id: cartItem.productId,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          product: product || null,
        };
      })
      .filter((item) => item.product !== null);
  }, [localCart, guestProductsData, isAuthenticated]);

  // Calculate totals
  const cartItems = isAuthenticated ? data?.cart?.items || [] : guestCartItems;

  const total = useMemo(() => {
    if (isAuthenticated) {
      return data?.cart?.total || 0;
    }
    return guestCartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  }, [isAuthenticated, data?.cart?.total, guestCartItems]);

  const itemCount = useMemo(() => {
    if (isAuthenticated) {
      return data?.cart?.itemCount || 0;
    }
    return localCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [isAuthenticated, data?.cart?.itemCount, localCart]);

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1): Promise<void> => {
      if (isAuthenticated) {
        try {
          await addToCartMutation({
            variables: { productId, quantity },
            refetchQueries: [{ query: GET_CART }],
            awaitRefetchQueries: true,
          });
          toast.success('Added to cart!');
        } catch (error) {
          console.error('Failed to add to cart:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
          toast.error(errorMessage);
          throw error;
        }
      } else {
        try {
          setLocalCart((prev) => {
            const existingItem = prev.find((item) => item.productId === productId);
            let newCart;
            if (existingItem) {
              newCart = prev.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
            } else {
              newCart = [...prev, { productId, quantity }];
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
            return newCart;
          });
          toast.success('Added to cart!');
        } catch (error) {
          console.error('Failed to add to cart:', error);
          toast.error('Failed to add to cart');
          throw error;
        }
      }
    },
    [isAuthenticated, addToCartMutation]
  );

  const removeFromCart = useCallback(
    async (productId: string): Promise<void> => {
      if (isAuthenticated) {
        try {
          await removeFromCartMutation({
            variables: { productId },
            refetchQueries: [{ query: GET_CART }],
            awaitRefetchQueries: true,
          });
          toast.success('Removed from cart');
        } catch (error) {
          console.error('Failed to remove from cart:', error);
          toast.error(error.message || 'Failed to remove from cart');
          throw error;
        }
      } else {
        try {
          setLocalCart((prev) => {
            const newCart = prev.filter((item) => item.productId !== productId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
            return newCart;
          });
          toast.success('Removed from cart');
        } catch (error) {
          console.error('Failed to remove from cart:', error);
          toast.error('Failed to remove from cart');
          throw error;
        }
      }
    },
    [isAuthenticated, removeFromCartMutation]
  );

  // Debounced update for quantity changes
  const updateQuantityDebounced = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const updateQuantity = useCallback(
    async (productId: string, quantity: number): Promise<void> => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (isAuthenticated) {
        // Clear existing timeout for this product
        if (updateQuantityDebounced.current[productId]) {
          clearTimeout(updateQuantityDebounced.current[productId]);
        }

        // Debounce the update
        updateQuantityDebounced.current[productId] = setTimeout(async () => {
          try {
            await updateCartItemMutation({
              variables: { productId, quantity },
              refetchQueries: [{ query: GET_CART }],
              awaitRefetchQueries: true,
            });
          } catch (error) {
            console.error('Failed to update cart item:', error);
            toast.error(error.message || 'Failed to update quantity');
            throw error;
          }
        }, 500);
      } else {
        try {
          setLocalCart((prev) => {
            const newCart = prev.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            );
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
            return newCart;
          });
        } catch (error) {
          console.error('Failed to update cart item:', error);
          toast.error('Failed to update quantity');
          throw error;
        }
      }
    },
    [isAuthenticated, updateCartItemMutation, removeFromCart]
  );

  const clearCart = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      try {
        await clearCartMutation({
          refetchQueries: [{ query: GET_CART }],
          awaitRefetchQueries: true,
        });
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Failed to clear cart:', error);
        toast.error(error.message || 'Failed to clear cart');
        throw error;
      }
    } else {
      try {
        setLocalCart([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Failed to clear cart:', error);
        toast.error('Failed to clear cart');
        throw error;
      }
    }
  }, [isAuthenticated, clearCartMutation]);

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
