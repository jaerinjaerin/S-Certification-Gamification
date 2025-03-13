import { headers } from 'next/headers';

export const getSearchParams = () => {
  const url = new URL(headers().get('x-current-url')!);
  // searchParams가 URLSearchParams인지 확인
  if (!(url.searchParams instanceof URLSearchParams)) {
    return new URLSearchParams(url.searchParams as any);
  }
  return url.searchParams;
};
