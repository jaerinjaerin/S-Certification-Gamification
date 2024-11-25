import { useEffect, useState } from "react";

type useGetItemListProps = {
  url: string;
  additionalParams?: object;
};

function useGetItemList<T>(props: useGetItemListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetchData();
  }, [props.url]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...props.additionalParams,
      }).toString();

      const response = await fetch(`${props.url}?${queryParams}`, {
        cache: "no-store",
      });

      const data = await response.json();
      const { items, count } = data;

      setItems(items as T[]);
    } catch (error: any) {
      const errorMessage = error.error.name;
      console.error("Error:", error, errorMessage);
      setError(errorMessage ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  return { isLoading, items, error, refetch };
}

export default useGetItemList;
