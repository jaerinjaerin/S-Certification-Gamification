import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

export function ToggleButtons({
  type,
  data,
  field,
}: {
  type: "multiple" | "single";
  data: { label: string; value: string }[];
  field: ControllerRenderProps<FieldValues, string>;
}) {
  if (type === "single") {
    return (
      <ToggleGroup
        type="single"
        onValueChange={field.onChange}
        defaultValue={data[0]?.value}
      >
        {data.map((item) => {
          return (
            <ToggleGroupItem key={item.label} value={item.value}>
              {item.label}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    );
  }
  return (
    <ToggleGroup type="multiple" onValueChange={field.onChange}>
      {data.map((item) => {
        return (
          <ToggleGroupItem key={item.label} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

export function ToggleUserButtons({
  data,
  field,
}: {
  data: { label: string; value: string }[];
  field: ControllerRenderProps<FieldValues, string>;
}) {
  const [selected, setSelected] = useState(data[0]?.value);

  return (
    <ToggleGroup
      type="single"
      onValueChange={(e) => {
        setSelected(e);
        field.onChange(e);
      }}
      className="bg-zinc-100 px-1 rounded-lg space-x-2"
      defaultValue={field.value}
    >
      {data.map((item) => {
        return (
          <ToggleGroupItem
            className={cn(
              "text-zinc-600",
              selected === item.value && "!bg-white size-auto !px-2 !py-1"
            )}
            key={item.label}
            value={item.value}
          >
            {item.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
