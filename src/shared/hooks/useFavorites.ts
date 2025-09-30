import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useAuth } from '../contexts/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  const { data, refetch } = useQuery(GET_USER_FAVORITES, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const [toggleFavoriteMutation] = useMutation(TOGGLE_FAVORITE_MUTATION);

  useEffect(() => {
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

  const toggleFavorite = async (productId: string): Promise<void> => {
    if (isAuthenticated) {
      try {
        await toggleFavoriteMutation({ variables: { productId } });
        await refetch();
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    } else {
      setLocalFavorites((prev) => {
        const newFavorites = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFavorites));
        return newFavorites;
      });
    }
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
