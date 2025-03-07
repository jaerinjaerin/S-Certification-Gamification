/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildWhereCondition } from './where';

// search parameters로 들어오는 date값 Date로 변환
export const parseDateFromQuery = (query: QueryParams): ParsedDateRange => {
  const from = query['date.from'] ? new Date(query['date.from']) : new Date();
  const to = query['date.to'] ? new Date(query['date.to']) : new Date();

  return { from, to };
};

export const querySearchParams = (
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
) => {
  // URLSearchParams인지 확인하고 아니면 변환
  if (!(searchParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(searchParams as Record<string, string>);
  }

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

export const paramsToQueries = (params: Record<string, any>) => {
  if (params?.key) delete params.key;
  //
  const take = Number(params?.take ?? 10);
  const skip = take * (Number(params?.page ?? 1) - 1);

  // Parse period from params
  const period = params?.date || { from: new Date(), to: new Date() };

  // Build where condition
  const where = buildWhereCondition(params, period);

  return { params, period, where, take, skip };
};

export const searchToQuery = (params: Record<string, any>) => {
  if (!params) return;
  if (params?.key) delete params.key;

  const take = Number(params?.take ?? 10);
  const skip = take * (Number(params?.page ?? 1) - 1);

  // Parse period from params
  const period = parseDateFromQuery(params);

  // Build where condition
  const where = buildWhereCondition(params, period);

  return { params, period, where, take, skip };
};

export const searchParamsToJson = (searchParams: URLSearchParams) => {
  return Object.fromEntries(searchParams.entries());
};
