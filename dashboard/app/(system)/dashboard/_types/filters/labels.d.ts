type FilterLabelItem = {
  label: string;
  type: "select" | "date";
};

type FilterLabels = {
  overview: FilterLabelItem[];
  user: FilterLabelItem[];
  quiz: FilterLabelItem[];
};
