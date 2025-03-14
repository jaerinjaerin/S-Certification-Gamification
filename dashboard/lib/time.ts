export const defaultDateFormat = (date: Date) => {
  return date.toISOString().split('T')[0].replace(/-/g, '.');
};

export const setHoursFromZeroToEnd = (start: Date, end: Date) => {
  const startDate = new Date(start);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setUTCHours(23, 59, 59, 999);

  return {
    startedAt: startDate.toISOString(),
    endedAt: endDate.toISOString(),
  };
};
