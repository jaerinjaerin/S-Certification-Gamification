import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
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
  const [selected, setSelected] = useState(field.value);

  useEffect(() => {
    setSelected(field.value);
  }, [field]);

  return (
    <ToggleGroup
      type="single"
      onValueChange={(e) => {
        setSelected(e);
        field.onChange(e);
      }}
      className="bg-zinc-100 text-zinc-600 px-1 rounded-lg space-x-2"
      value={selected}
    >
      {data.map((item) => {
        return (
          <ToggleGroupItem
            className={cn(
              selected === item.value &&
                "text-zinc-950 !bg-white size-auto !px-2 !py-1"
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
