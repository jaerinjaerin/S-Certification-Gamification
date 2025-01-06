"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

const dateOptions = {
  locale: "en-US",
  options: {
    year: "numeric",
    month: "short",
    day: "2-digit",
  } as Intl.DateTimeFormatOptions,
};

export function CalendarForm({
  label = "Date",
  width = "20rem",
  field,
}: {
  label?: string;
  width?: number | string;
  field: ControllerRenderProps<FieldValues, string>;
}) {
  // 날짜 범위를 문자열로 표시
  const getDateRangeText = () => {
    if (!field?.value?.from && !field?.value?.to) return "Pick a date";
    const from = field.value.from
      ? field.value.from.toLocaleDateString(
          dateOptions.locale,
          dateOptions.options
        )
      : "Start";
    const to = field.value.to
      ? field.value.to.toLocaleDateString(
          dateOptions.locale,
          dateOptions.options
        )
      : "End";
    return `${from} - ${to}`;
  };

  return (
    <div className="flex items-center space-x-4">
      <div>{label}</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "block",
              !field?.value?.from && "text-muted-foreground"
            )}
            style={{ minWidth: "7rem", width }}
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 opacity-50" />
              <span>{getDateRangeText()}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range" // 날짜 범위 선택 모드
            selected={field.value}
            onSelect={field.onChange}
            disabled={
              (date) => date > new Date() || date < new Date("1900-01-01") // 제한된 날짜
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
