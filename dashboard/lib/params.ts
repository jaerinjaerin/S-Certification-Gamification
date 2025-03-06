import { headers } from 'next/headers';

export const getSearchParams = () => {
  const url = new URL(headers().get('x-current-url')!);
  return url.searchParams;
};
