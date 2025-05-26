'use client';

import { gql, useMutation, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export function useLogout(options?: { redirectTo?: string }) {
  const router = useRouter();
  const client = useApolloClient();
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION, {
    fetchPolicy: 'no-cache',
    onCompleted: async (data) => {
      if (data.logout) {
        toast.success('Logged out successfully');
        await client.resetStore();

        if (options?.redirectTo) {
          router.push(options.redirectTo);
        }
      } else {
        toast.error('Logout failed');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'An error occurred');
    },
  });

  return { logoutMutation: () => logoutMutation(), logoutLoading };
}
