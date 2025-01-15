// search parameters로 들어오는 date값 Date로 변환
export const parseDateFromQuery = (query: QueryParams): ParsedDateRange => {
  const from = query["date.from"] ? new Date(query["date.from"]) : null;
  const to = query["date.to"] ? new Date(query["date.to"]) : null;

  return { from, to };
};
