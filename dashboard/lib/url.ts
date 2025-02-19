/* eslint-disable @typescript-eslint/no-explicit-any */
import { serializeJsonToQuery } from '@/lib/search-params';

export const updateSearchParamsOnUrl = (data: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined') {
      const filteredData: Record<string, any> = Object.fromEntries(
        Object.entries(data).filter(
          ([, value]) => value !== 'all' && value !== ''
        )
      );

      const params = serializeJsonToQuery(filteredData);
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', url);
    }
  } catch (error) {
    console.error('Failed to update search params:', error);
  }
};
