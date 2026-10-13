import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

let sessionGeneration = 0;

export function getSessionGeneration() {
  return sessionGeneration;
}

// Run before installing a new identity, and whenever the current session ends.
export function clearSessionQueryCache() {
  sessionGeneration += 1;
  void queryClient.cancelQueries();
  queryClient.clear();
}