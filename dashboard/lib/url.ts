/* eslint-disable @typescript-eslint/no-explicit-any */
import { serializeJsonToQuery } from '@/lib/search-params';

export const transformFormData = (form: Record<string, any>) => {
  const filteredData: Record<string, any> = Object.fromEntries(
    Object.entries(form).filter(([, value]) => value !== 'all' && value !== '')
  );

  return serializeJsonToQuery(filteredData);
};

export const updateSearchParamsOnUrl = (data: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined') {
      const params = transformFormData(data);
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', url);
    }
  } catch (error) {
    console.error('Failed to update search params:', error);
  }
};
