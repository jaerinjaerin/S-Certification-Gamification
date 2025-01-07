// src/utils/apiClient.ts

export const apiClient = {
  /**
   * Perform a GET request.
   * @param url The URL to fetch.
   * @returns The response data as a generic type.
   */
  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
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
   * @returns The response data as a generic type.
   */
  post: async <T, U>(url: string, body: T): Promise<U> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
   * @returns The response data as a generic type.
   */
  put: async <T, U>(url: string, body: T): Promise<U> => {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`PUT ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<U>;
  },

  /**
   * Perform a DELETE request.
   * @param url The URL to fetch.
   * @returns The response data as a generic type.
   */
  delete: async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
      method: "DELETE",
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`DELETE ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
