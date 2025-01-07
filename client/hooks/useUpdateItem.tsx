import { CustomError } from "@/types/type";
import { useState } from "react";

export default function useUpdateItem<T>() {
  const [item, setItem] = useState<T>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const initialize = () => {
    setItem(undefined);
    setSuccess(false);
    setError(undefined);
  };

  const updateItem = async ({
    url,
    body,
  }: {
    url: string;
    body: object;
  }): Promise<void> => {
    setIsLoading(true);

    initialize();
    // console.log("body", body);

    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.error("response", response);
          return response.json().then((err) => Promise.reject(err));
        }
      })
      .then((data) => {
        const { item } = data as {
          item: T;
        };

        // console.log("updateItem item", item);

        setItem(item);
        setSuccess(true);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          const customError = error as CustomError;
          setError(customError?.error?.name ?? customError.message);
        } else {
          setError("Something went wrong");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { isLoading, success, error, item, updateItem };
}
