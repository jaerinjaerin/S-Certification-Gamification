"use client";
import SelectForm from "@/components/system/select-with-title";
import { Button } from "@/components/ui/button";
import FiltersContainer from "@/components/system/filters-container";
import { ControllerRenderProps, FieldValues, useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatCamelCaseToTitleCase } from "@/lib/text";
import { CalendarForm } from "@/components/system/calendar-with-title";
import { ToggleUserButtons } from "@/components/system/toggle-buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

const OverviewFilterForm = () => {
  const form = useForm();
  const [filterData, setFilterData] = useState<AllFilterData | null>(null);

  useEffect(() => {
    axios.get("/api/dashboard/filter").then((res) => {
      setFilterData(res.data);
    });
  }, []);

  function onSubmit(data: FieldValues) {
    console.log("🚀 ~ onSubmit ~ data:", data);
  }

  if (!filterData) return;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="campaign"
            defaultValue={filterData.campaign[0].id}
            render={({ field }) => (
              <CampaignSelectForm
                field={field}
                items={filterData.campaign.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            )}
          />
          <Button variant="outline">
            <div className="flex items-center space-x-2 text-zinc-950">
              <Download />
              <span>Download Report</span>
            </div>
          </Button>
        </div>
        <FiltersContainer className="space-y-7">
          <div className="flex items-center space-x-5">
            <FormField
              control={form.control}
              name="date"
              defaultValue={{
                from: new Date(filterData.campaign[0].startedAt),
                to: new Date(filterData.campaign[0].endedAt),
              }}
              render={({ field }) => {
                return <CalendarForm field={field} />;
              }}
            />
            <FormField
              control={form.control}
              name="userGroup"
              defaultValue="all"
              render={({ field }) => {
                return (
                  <ToggleUserButtons
                    data={Object.entries(filterData.userGroup).map(
                      ([, value]) => ({ label: value.name, value: value.id })
                    )}
                    field={field}
                  />
                );
              }}
            />
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-7">
            {Object.entries(filterData.filters).map(([key, value]) => {
              const items = [
                { value: "all", label: "All" },
                ...value.map((item: { name: string; id: string | number }) => ({
                  label: item.name,
                  value: item.id,
                })),
              ];
              return (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  defaultValue="all"
                  render={({ field }) => (
                    <SelectForm
                      label={formatCamelCaseToTitleCase(key)}
                      width="auto"
                      field={field}
                      items={items}
                    />
                  )}
                />
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="w-32">
              Apply
            </Button>
          </div>
        </FiltersContainer>
      </form>
    </Form>
  );
};

export default OverviewFilterForm;

const CampaignSelectForm = ({
  field,
  items,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  items: { label: string; value: string | number }[];
}) => {
  return (
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <SelectTrigger
        className={cn(
          "w-auto space-x-3 shadow-none bg-white hover:bg-zinc-100 border-0 hover:bg-transparent focus:bg-transparent focus:ring-0 focus:outline-none !text-size-20px font-bold",
          !field.value && "text-muted-foreground"
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value.toString()}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
