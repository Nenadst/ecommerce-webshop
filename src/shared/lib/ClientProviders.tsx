'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from '../config/apollo-client';
import { AuthProvider } from '../contexts/AuthContext';
import { CartDrawerProvider } from '../contexts/CartDrawerContext';
import CartDrawer from '../components/cart/CartDrawer';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <CartDrawerProvider>
          {children}
          <CartDrawer />
        </CartDrawerProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
