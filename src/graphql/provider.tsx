/**
 * @file provider.tsx
 * @description Apollo Provider wrapper component
 */

import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import apolloClient from './apollo-client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}

export default ApolloProvider;
