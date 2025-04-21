'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from './apollo-client';
import { Toaster } from 'react-hot-toast';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <Toaster />
      {children}
    </ApolloProvider>
  );
}
