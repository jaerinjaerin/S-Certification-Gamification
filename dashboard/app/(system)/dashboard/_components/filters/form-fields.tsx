import { CalendarForm } from "@/components/system/calendar-with-title";
import SelectForm from "@/components/system/select-with-title";
import { FormField } from "@/components/ui/form";
import { Control, FieldValues } from "react-hook-form";

type Props = {
  labels: FilterLabelItem[];
  control: Control<FieldValues>;
  width?: string | number;
};

const FormFileds = ({ labels, control, width }: Props) => {
  return (
    <>
      {labels.map(({ label, type }) => {
        const name = label.toLowerCase();
        return (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => {
              const props = { label, field, ...(width && { width }) };
              return type === "date" ? (
                <CalendarForm {...props} />
              ) : (
                <SelectForm {...props} />
              );
            }}
          />
        );
      })}
    </>
  );
};

export default FormFileds;
