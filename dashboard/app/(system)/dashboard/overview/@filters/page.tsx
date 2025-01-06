"use client";
import SelectForm from "@/components/system/select-with-title";
import { Button } from "@/components/ui/button";
import { CalendarForm } from "@/components/system/calendar-with-title";
import FiltersContainer from "@/components/system/filters-container";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";

const labels = [
  "Region",
  "Subaisiary",
  "Domain",
  "Channel Segment",
  "Sales format",
  "Job Group",
  "Channel",
];

const width = "8rem";
const OverviewFilterForm = () => {
  const form = useForm();

  function onSubmit(data) {
    console.log("🚀 ~ onSubmit ~ data:", data);
    // toast({
    //   title: "You submitted the following values:",
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1.5">
        <FiltersContainer className="gap-x-10 flex flex-wrap">
          <FormField
            control={form.control}
            name="certification"
            render={({ field }) => (
              <SelectForm label="Certification" field={field} />
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => <CalendarForm field={field} />}
          />

          <FormField
            control={form.control}
            name="expert-criteria"
            render={({ field }) => (
              <SelectForm label="Expert criteria" field={field} />
            )}
          />
        </FiltersContainer>
        <FiltersContainer>
          <div className="flex flex-wrap gap-x-10 gap-y-7">
            {labels.map((label) => {
              return (
                <FormField
                  key={label}
                  control={form.control}
                  name={label.replace(" ", "-").toLowerCase()}
                  render={({ field }) => (
                    <SelectForm label={label} width={width} field={field} />
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
