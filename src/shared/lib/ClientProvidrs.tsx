'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from '../config/apollo-client';
import { AuthProvider } from '../contexts/AuthContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
