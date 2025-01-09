type FilterLabelItem = {
  label: string;
  type: "select" | "date";
};

type FilterLabelGroup = {
  primary: FilterLabelItem[];
  secondary: FilterLabelItem[];
};

type FilterLabels = {
  overview: FilterLabelGroup;
  user: FilterLabelGroup;
  quiz: FilterLabelGroup;
};
