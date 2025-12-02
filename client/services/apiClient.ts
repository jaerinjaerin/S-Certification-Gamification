// src/utils/apiClient.ts

export const apiClient = {
  /**
   * Perform a GET request.
   * @param url The URL to fetch.
   * @param cachePolicy The cache policy for the request.
   * @returns The response data as a generic type.
   */
  get: async <T>(
    url: string,
    cachePolicy: RequestCache = "no-store"
  ): Promise<T> => {
    const response = await fetch(url, {
      method: "GET",
      cache: cachePolicy,
    });

    if (!response.ok) {
      throw new Error(`GET ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  },

  /**
   * Perform a POST request.
   * @param url The URL to fetch.
   * @param body The body of the request.
   * @param cachePolicy The cache policy for the request.
   * @returns The response data as a generic type.
   */
  post: async <T, U>(
    url: string,
    body: T,
    cachePolicy: RequestCache = "no-store"
  ): Promise<U> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: cachePolicy,
    });

    if (!response.ok) {
      throw new Error(`POST ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<U>;
  },

  /**
   * Perform a PUT request.
   * @param url The URL to fetch.
   * @param body The body of the request.
   * @param cachePolicy The cache policy for the request.
   * @returns The response data as a generic type.
   */
  put: async <T, U>(
    url: string,
    body: T,
    cachePolicy: RequestCache = "no-store"
  ): Promise<U> => {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: cachePolicy,
    });

    if (!response.ok) {
      throw new Error(`PUT ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<U>;
  },

  /**
   * Perform a DELETE request.
   * @param url The URL to fetch.
   * @param cachePolicy The cache policy for the request.
   * @returns The response data as a generic type.
   */
  delete: async <T>(
    url: string,
    cachePolicy: RequestCache = "no-store"
  ): Promise<T> => {
    const response = await fetch(url, {
      method: "DELETE",
      cache: cachePolicy,
    });

    if (!response.ok) {
      throw new Error(`DELETE ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
