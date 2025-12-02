import { ERROR_CODES, ErrorCode } from "@/constants/error-codes";
import { ApiResponseV3 } from "@/types/apiTypes";
import { CustomError } from "@/types/type";
import { useState } from "react";

interface CreateItemError {
  code: ErrorCode;
  message: string;
}

export default function useCreateItem<T>() {
  const [item, setItem] = useState<T>();
  const [error, setError] = useState<CreateItemError>();
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

      const data = await response.json();
      console.log("data", data);
      if (!data.success) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      const { result } = data as ApiResponseV3<T>;
      const item = result.item as T;
      setItem(item);
      setSuccess(true);
      setIsLoading(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const customError = error as CustomError;
        setError({
          code: ERROR_CODES.UNKNOWN,
          message: customError.message,
        });
      } else {
        setError({
          code: ERROR_CODES.UNKNOWN,
          message: "Something went wrong",
        });
      }
      setIsLoading(false);
      setSuccess(false);
    }
  };

  return { isLoading, error, item, success, createItem };
}
