import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useAuth } from '../contexts/AuthContext';
import { CREATE_ACTIVITY_LOG } from '../graphql/mutations/activity.mutations';

const GET_USER_FAVORITES = gql`
  query GetUserFavorites {
    userFavorites
  }
`;

const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavorite($productId: ID!) {
    toggleFavorite(productId: $productId)
  }
`;

const LOCAL_STORAGE_KEY = 'guest_favorites';

export function useFavorites() {
  const { isAuthenticated, user } = useAuth();
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const { data, refetch } = useQuery(GET_USER_FAVORITES, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const [toggleFavoriteMutation] = useMutation(TOGGLE_FAVORITE_MUTATION);
  const [createActivityLog] = useMutation(CREATE_ACTIVITY_LOG);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setLocalFavorites(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse favorites:', error);
          setLocalFavorites([]);
        }
      }
    }
  }, [isAuthenticated]);

  const favorites = isAuthenticated ? data?.userFavorites || [] : localFavorites;

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const toggleFavorite = async (productId: string, productName?: string): Promise<void> => {
    const wasFavorite = isFavorite(productId);
    const action = wasFavorite ? 'REMOVE_FROM_WISHLIST' : 'ADD_TO_WISHLIST';
    const description = wasFavorite
      ? `Removed ${productName || 'product'} from wishlist`
      : `Added ${productName || 'product'} to wishlist`;

    if (isAuthenticated) {
      try {
        await toggleFavoriteMutation({ variables: { productId } });
        await refetch();

        // Track activity
        try {
          await createActivityLog({
            variables: {
              input: {
                userId: user?.id,
                userName: user?.name || user?.email,
                action,
                description,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                path: typeof window !== 'undefined' ? window.location.pathname : undefined,
                metadata: JSON.stringify({ productId, productName }),
              },
            },
          });
        } catch (error) {
          console.error('Failed to track activity:', error);
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    } else {
      setLocalFavorites((prev) => {
        const newFavorites = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFavorites));

        // Track activity for guest users
        try {
          createActivityLog({
            variables: {
              input: {
                userId: user?.id,
                userName: user?.name || user?.email,
                action,
                description,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                path: typeof window !== 'undefined' ? window.location.pathname : undefined,
                metadata: JSON.stringify({ productId, productName }),
              },
            },
          });
        } catch (error) {
          console.error('Failed to track activity:', error);
        }

        return newFavorites;
      });
    }
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    mounted,
  };
}
