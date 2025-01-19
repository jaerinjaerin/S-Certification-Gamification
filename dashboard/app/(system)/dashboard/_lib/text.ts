export const legendCapitalizeFormatter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const legendUpperCaseFormatter = (text: string) => {
  return text.toUpperCase();
};
