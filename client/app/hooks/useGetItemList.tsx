import { useEffect, useState } from "react";
import { CustomError } from "../types/type";

type useGetItemListProps = {
  url: string;
  additionalParams?: object;
};

function useGetItemList<T>(props: useGetItemListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string>();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...props.additionalParams,
      }).toString();

      const response = await fetch(`${props.url}?${queryParams}`, {
        cache: "no-store",
      });

      console.info("useGetItemList call", props.url, response);

      const data = await response.json();
      const { items /* count */ } = data as {
        items: T[];
        // count: number;
      };

      setItems(items as T[]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const customError = error as CustomError;
        setError(customError?.error?.name ?? customError.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.url, fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { isLoading, items, error, refetch };
}

export default useGetItemList;
