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
  width = "20rem",
  field,
}: {
  label: string;
  placeholder?: string;
  width?: number | string;
  field: ControllerRenderProps<FieldValues, string>;
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">{label}</div>
      <Select onValueChange={field.onChange}>
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
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectForm;
