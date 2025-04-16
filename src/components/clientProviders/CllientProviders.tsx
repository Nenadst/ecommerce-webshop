'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/lib/apollo-client';
import { AuthProvider } from '@/lib/authContext';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
