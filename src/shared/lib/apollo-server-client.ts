import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export function getClient() {
  const isServer = typeof window === 'undefined';

  let uri: string;

  if (isServer) {
    if (process.env.VERCEL_URL) {
      uri = `https://${process.env.VERCEL_URL}/api/graphql`;
    } else {
      uri = 'http://localhost:3000/api/graphql';
    }
  } else {
    uri = '/api/graphql';
  }

  return new ApolloClient({
    link: new HttpLink({
      uri,
      fetch,
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });
}
