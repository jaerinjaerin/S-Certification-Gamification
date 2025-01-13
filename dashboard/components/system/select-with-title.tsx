"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

const SelectForm = ({
  label,
  placeholder = "Select",
  width = "auto",
  field,
  items,
}: {
  label?: string | undefined;
  placeholder?: string;
  width?: number | string;
  field: ControllerRenderProps<FieldValues, string>;
  items: { label: string; value: string | number }[];
}) => {
  return (
    <div className="flex items-center space-x-4">
      {label && <div className="flex-shrink-0">{label}</div>}
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger
          className={cn(
            "bg-white hover:bg-zinc-100",
            !field.value && "text-muted-foreground"
          )}
          style={{ minWidth: "7rem", width }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value.toString()}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectForm;
