'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from '../config/apollo-client';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
