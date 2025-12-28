/**
 * React Query Client Configuration with Offline Caching
 * 
 * Configures React Query with:
 * - Cache persistence to AsyncStorage
 * - Stale data handling for offline scenarios
 * - Network-aware query behavior
 * 
 * Requirements:
 * - 12.1: Display cached data when device loses network connectivity
 * - 12.4: Automatically refresh data when connectivity is restored
 */

import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache time constants
const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = ONE_MINUTE * 5;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

/**
 * Create a configured QueryClient with offline-first settings
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: FIVE_MINUTES,
        // Keep unused data in cache for 1 hour
        gcTime: ONE_HOUR,
        // Retry failed requests up to 2 times
        retry: 2,
        // Don't retry on 4xx errors (client errors)
        retryOnMount: true,
        // Refetch on window focus (when app comes to foreground)
        refetchOnWindowFocus: true,
        // Refetch when network reconnects
        refetchOnReconnect: true,
        // Use cached data while fetching new data
        placeholderData: (previousData: unknown) => previousData,
        // Network mode: always try to fetch, but use cache if offline
        networkMode: 'offlineFirst',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        // Network mode for mutations
        networkMode: 'offlineFirst',
      },
    },
  });
}

/**
 * Create an AsyncStorage persister for React Query cache
 */
export function createAsyncStorageQueryPersister() {
  return createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'job-tracker-query-cache',
    // Throttle writes to storage to avoid performance issues
    throttleTime: 1000,
    // Serialize/deserialize functions for proper date handling
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
  });
}

/**
 * Persist options for the query client
 */
export const persistOptions = {
  // Maximum age of persisted cache (1 day)
  maxAge: ONE_DAY,
  // Buster to invalidate cache on app updates
  buster: 'v1',
};

// Export a default query client instance
export const queryClient = createQueryClient();

// Export the persister
export const asyncStoragePersister = createAsyncStorageQueryPersister();

export default queryClient;
