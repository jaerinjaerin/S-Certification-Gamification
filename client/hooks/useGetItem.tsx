import { useEffect, useState } from "react";

export default function useGetItem<T>(
  url: string,
  cachePolicy: RequestCache = "no-store"
) {
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState<T>();
  const [error, setError] = useState<unknown>();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(url, {
        cache: cachePolicy, // 전달받은 cache 정책 적용
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setItem(data.item);
    } catch (error: unknown) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, cachePolicy, fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { isLoading, item, error, refetch };
}
