import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@/graphql/provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { registerServiceWorker } from '@/register-sw'
import { initSentry } from '@/lib/sentry'
import './index.css'
import App from '@/App'

if (import.meta.env.PROD) {
  initSentry()
  registerServiceWorker()
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </ApolloProvider>
  </StrictMode>,
)
