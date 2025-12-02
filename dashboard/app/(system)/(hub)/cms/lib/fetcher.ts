import axios from 'axios';

// export const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`Failed to fetch data from ${url}`);
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
};
