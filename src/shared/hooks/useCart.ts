import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
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
          images
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
      images
      quantity
      category {
        id
        name
      }
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      quantity
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

export function useCartInternal() {
  const { isAuthenticated } = useAuth();
  const client = useApolloClient();
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const migrationAttempted = useRef(false);

  const { data, refetch, loading } = useQuery(GET_CART, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const productIds = useMemo(() => {
    return localCart.map((item) => item.productId);
  }, [localCart]);

  const {
    data: guestProductsData,
    refetch: refetchGuestProducts,
    loading: guestProductsLoading,
  } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: { ids: productIds },
    skip: isAuthenticated || productIds.length === 0,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
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

    const handleCartCleared = () => {
      if (isAuthenticated) {
        refetch();
      } else {
        setLocalCart([]);
      }
    };

    window.addEventListener('cart-cleared', handleCartCleared);
    return () => {
      window.removeEventListener('cart-cleared', handleCartCleared);
    };
  }, [isAuthenticated, refetch]);

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

  useEffect(() => {
    if (!isAuthenticated) {
      migrationAttempted.current = false;
    }
  }, [isAuthenticated]);

  const guestCartItems = useMemo(() => {
    if (isAuthenticated) {
      return [];
    }

    if (localCart.length === 0) {
      return [];
    }

    if (!guestProductsData?.productsByIds) {
      return [];
    }

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
  }, [localCart, guestProductsData, isAuthenticated, guestProductsLoading]);

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
    } else {
      return localCart.reduce((sum, item) => sum + item.quantity, 0);
    }
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
          const { data: productData } = await client.query({
            query: GET_PRODUCT,
            variables: { id: productId },
            fetchPolicy: 'network-only',
          });

          if (!productData?.product) {
            toast.error('Product not found');
            throw new Error('Product not found');
          }

          const product = productData.product;
          const existingItem = localCart.find((item) => item.productId === productId);
          const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

          if (product.quantity < totalQuantity) {
            toast.error(`Not enough stock available. Only ${product.quantity} left in stock.`);
            throw new Error('Not enough stock available');
          }

          let newCart: CartItem[];
          setLocalCart((prev) => {
            const existingItem = prev.find((item) => item.productId === productId);
            if (existingItem) {
              newCart = prev.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
            } else {
              newCart = [...prev, { id: productId, productId, quantity }];
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
            return newCart;
          });

          setTimeout(() => {
            if (newCart && newCart.length > 0) {
              const newIds = newCart.map((c) => c.productId);
              refetchGuestProducts({ ids: newIds });
            }
          }, 0);

          toast.success('Added to cart!');
        } catch (error) {
          console.error('Failed to add to cart:', error);
          if (
            error instanceof Error &&
            error.message !== 'Not enough stock available' &&
            error.message !== 'Product not found'
          ) {
            toast.error('Failed to add to cart');
          }
          throw error;
        }
      }
    },
    [isAuthenticated, addToCartMutation, client, localCart, refetchGuestProducts]
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
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to remove from cart';
          toast.error(errorMessage);
          throw error;
        }
      } else {
        try {
          setLocalCart((prev) => {
            const newCart = prev.filter((item) => item.productId !== productId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
            return newCart;
          });

          setTimeout(() => refetchGuestProducts(), 0);

          toast.success('Removed from cart');
        } catch (error) {
          console.error('Failed to remove from cart:', error);
          toast.error('Failed to remove from cart');
          throw error;
        }
      }
    },
    [isAuthenticated, removeFromCartMutation, refetchGuestProducts]
  );

  const updateQuantityDebounced = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const updateQuantity = useCallback(
    async (productId: string, quantity: number): Promise<void> => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (isAuthenticated) {
        if (updateQuantityDebounced.current[productId]) {
          clearTimeout(updateQuantityDebounced.current[productId]);
        }

        updateQuantityDebounced.current[productId] = setTimeout(async () => {
          try {
            await updateCartItemMutation({
              variables: { productId, quantity },
              refetchQueries: [{ query: GET_CART }],
              awaitRefetchQueries: true,
            });
          } catch (error) {
            console.error('Failed to update cart item:', error);
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to update quantity';
            toast.error(errorMessage);
            throw error;
          }
        }, 500);
      } else {
        try {
          const { data: productData } = await client.query({
            query: GET_PRODUCT,
            variables: { id: productId },
            fetchPolicy: 'network-only',
          });

          if (!productData?.product) {
            toast.error('Product not found');
            throw new Error('Product not found');
          }

          const product = productData.product;

          if (product.quantity < quantity) {
            toast.error(`Not enough stock available. Only ${product.quantity} left in stock.`);
            throw new Error('Not enough stock available');
          }

          setLocalCart((prev) => {
            const newCart = prev.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            );
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
            return newCart;
          });

          setTimeout(() => refetchGuestProducts(), 0);
        } catch (error) {
          console.error('Failed to update cart item:', error);
          if (
            error instanceof Error &&
            error.message !== 'Not enough stock available' &&
            error.message !== 'Product not found'
          ) {
            toast.error('Failed to update quantity');
          }
          throw error;
        }
      }
    },
    [isAuthenticated, updateCartItemMutation, removeFromCart, client, refetchGuestProducts]
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
        toast.error(errorMessage);
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
