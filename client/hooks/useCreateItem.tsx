import { useState } from "react";
import { CustomError } from "../../types/type";

export default function useCreateItem<T>() {
  const [item, setItem] = useState<T>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const createItem = async ({
    url,
    body,
  }: {
    url: string;
    body: object;
  }): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body != null ? JSON.stringify(body) : null,
      });

      if (response.status != 200) {
        setError(response.statusText);
        setIsLoading(false);
      }

      const data = await response.json();
      const { item } = data as {
        item: T;
      };
      setItem(item);
      setSuccess(true);
      setIsLoading(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const customError = error as CustomError;
        setError(customError?.error?.name ?? customError.message);
      } else {
        setError("Something went wrong");
      }
      setIsLoading(false);
      setSuccess(false);
    }
  };

  return { isLoading, error, item, success, createItem };
}
