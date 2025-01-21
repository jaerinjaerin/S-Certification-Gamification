export const defaultDateFormat = (date: Date) => {
  return date.toISOString().split("T")[0].replace(/-/g, ".");
};
