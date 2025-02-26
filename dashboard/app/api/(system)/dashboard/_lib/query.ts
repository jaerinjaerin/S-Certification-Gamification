/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildWhereCondition } from './where';

// search parameters로 들어오는 date값 Date로 변환
export const parseDateFromQuery = (query: QueryParams): ParsedDateRange => {
  const from = query['date.from'] ? new Date(query['date.from']) : new Date();
  const to = query['date.to'] ? new Date(query['date.to']) : new Date();

  return { from, to };
};

export const querySearchParams = (searchParams: URLSearchParams) => {
  // Convert searchParams to an object
  const params = Object.fromEntries(searchParams.entries()) as Record<
    string,
    any
  >;

  const take = Number(params?.take) ?? 10;
  const skip = take * (Number(params?.page || 1) - 1);

  // Parse period from params
  const period = parseDateFromQuery(params);

  // Build where condition
  const where = buildWhereCondition(params, period);

  return { params, period, where, take, skip };
};
