import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export function getClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/graphql',
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
