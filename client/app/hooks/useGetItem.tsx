import { useEffect, useState } from 'react';

export default function useGetItem<T>(url: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState<T>();
  const [error, setError] = useState<any>();

  useEffect(() => {
    fetchData();
  }, [url]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(url, {
        cache: 'no-store',
      });

      const data = await response.json();
      setItem(data.item);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  return { isLoading, item, error, refetch };
}
