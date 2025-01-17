import axios from "axios";
import { serializeJsonToQuery } from "./search-params";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchData = async (
  fieldValues: Record<string, any>,
  urlIdentifier: string,
  callback: (data: any) => void
) => {
  if (!fieldValues) return;

  try {
    const searchParams = serializeJsonToQuery(fieldValues);
    const url = `/api/dashboard/${urlIdentifier}?${searchParams.toString()}`;

    const response = await axios.get(url);
    callback(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
