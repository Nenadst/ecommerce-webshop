import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { cache } from 'react';

export const getClient = cache(() => {
  const isServer = typeof window === 'undefined';

  if (!isServer) {
    throw new Error('getClient should only be called on the server');
  }

  let uri: string;

  if (process.env.VERCEL_URL) {
    uri = `https://${process.env.VERCEL_URL}/api/graphql`;
  } else {
    uri = 'http://localhost:3000/api/graphql';
  }

  return new ApolloClient({
    link: new HttpLink({
      uri,
      fetch,
    }),
    cache: new InMemoryCache(),
    ssrMode: true,
    defaultOptions: {
      query: {
        errorPolicy: 'all',
      },
    },
  });
});
