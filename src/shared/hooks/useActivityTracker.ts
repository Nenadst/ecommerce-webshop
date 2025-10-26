import { useMutation } from '@apollo/client';
import { CREATE_ACTIVITY_LOG } from '../graphql/mutations/activity.mutations';
import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

export type ActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'LOGIN_FAILED'
  | 'VIEW_PAGE'
  | 'VIEW_PRODUCT'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'UPDATE_CART'
  | 'CLEAR_CART'
  | 'ADD_TO_WISHLIST'
  | 'REMOVE_FROM_WISHLIST'
  | 'PLACE_ORDER'
  | 'UPDATE_PROFILE'
  | 'CHANGE_PASSWORD'
  | 'SEARCH'
  | 'FILTER_PRODUCTS'
  | 'CHECKOUT_STARTED'
  | 'CHECKOUT_COMPLETED'
  | 'CHECKOUT_CANCELLED'
  | 'ADMIN_ACTION'
  | 'OTHER';

interface TrackActivityParams {
  action: ActivityType;
  description: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export const useActivityTracker = () => {
  const [createLog] = useMutation(CREATE_ACTIVITY_LOG);
  const { user } = useAuth();

  const trackActivity = useCallback(
    async ({ action, description, path, metadata }: TrackActivityParams) => {
      try {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
        const currentPath =
          path || (typeof window !== 'undefined' ? window.location.pathname : undefined);

        await createLog({
          variables: {
            input: {
              userId: user?.id,
              userName: user?.name || user?.email,
              action,
              description,
              userAgent,
              path: currentPath,
              metadata: metadata ? JSON.stringify(metadata) : undefined,
            },
          },
        });
      } catch (error) {
        // Silently fail to avoid disrupting user experience
        console.error('Failed to track activity:', error);
      }
    },
    [createLog, user]
  );

  return { trackActivity };
};
