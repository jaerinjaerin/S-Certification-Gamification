export const startOfDayTime = (date: Date | undefined | null) => {
  if (!date) return undefined;
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
};

export const endOfDayTime = (date: Date | undefined | null) => {
  if (!date) return undefined;
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    )
  );
};
