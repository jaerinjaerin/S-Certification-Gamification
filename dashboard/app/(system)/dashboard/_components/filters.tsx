"use client";
import SelectForm from "@/components/system/select-with-title";
import { Button } from "@/components/ui/button";
import FiltersContainer from "@/components/system/filters-container";
import { ControllerRenderProps, FieldValues, useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { useEffect, useRef, useState } from "react";
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

const Filters = ({
  hasDownloadButton = false,
  onSubmit,
}: {
  hasDownloadButton?: boolean;
  onSubmit: (data: FieldValues) => void;
}) => {
  const form = useForm();
  const formValues = form.watch();
  const [filterData, setFilterData] = useState<AllFilterData | null>(null);
  const [filteredSubsidiaries, setFilteredSubsidiaries] = useState<
    Subsidiary[]
  >([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const defaultValues = useRef<FieldValues | null>(null);
  const [applyButtonDisabled, setApplyButtonDisabled] = useState<boolean>(true);

  // 필터 데이터 불러오기기
  useEffect(() => {
    axios.get("/api/dashboard/filter").then((res) => {
      setFilterData(res.data);
      // Initialize dependencies
      setFilteredSubsidiaries(res.data.filters.subsidiary);
      setFilteredDomains(res.data.filters.domain);
      //
      Object.entries(res.data.filters).map(([key]) => {
        form.setValue(key, "all");
      });
      //
      defaultValues.current = form.getValues();
    });
  }, [form]);

  // 폼 데이터 상태 확인 후 현재 기준 값과 비교 (Apply버튼 활성여부)
  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      const comparison =
        JSON.stringify(formValues) === JSON.stringify(defaultValues.current);
      setApplyButtonDisabled(comparison);
    }
  }, [formValues]);

  const updateFilters = (key: string, id: string | number) => {
    if (!filterData) return;
    const { filters } = filterData;

    const isRegion = key === "region";
    const isSubsidiary = key === "subsidiary";
    const isDomain = key === "domain";

    if (isRegion) {
      if (id === "all") {
        form.setValue("subsidiary", "all");
        form.setValue("domain", "all");
        setFilteredSubsidiaries(filters.subsidiary);
        setFilteredDomains(filters.domain);
      } else {
        const found = filters.region.find((region) => region.id === id);
        if (found) {
          form.setValue("subsidiary", "all");
          form.setValue("domain", "all");
          setFilteredSubsidiaries(found.subsidiaries);
          setFilteredDomains(found.domains);
        }
      }
    } else if (isSubsidiary) {
      if (id === "all") {
        const found = filters.region.find(
          (region) => region.id === form.getValues().region
        );
        //
        if (found) {
          form.setValue("region", found.id);
          form.setValue("domain", "all");
          setFilteredSubsidiaries(found.subsidiaries);
          setFilteredDomains(found.domains);
        }
      } else {
        const found = filters.region.find((region) =>
          region.subsidiaries.some(
            (subsidiary: Subsidiary) => subsidiary.id === id
          )
        );

        const subsidiary = filters.subsidiary.find(
          (subsidiary: Subsidiary) => subsidiary.id === id
        );

        if (found) {
          form.setValue("region", found.id);
          form.setValue("domain", "all");
          setFilteredSubsidiaries(found.subsidiaries);
          setFilteredDomains(subsidiary.domains);
        }
      }
    } else if (isDomain) {
      if (id === "all") {
        return;
      } else {
        const found = filters.region.find((region) =>
          region.domains.some((domain: Domain) => domain.id === id)
        );

        const domain = filters.domain.find((domain) => domain.id === id);

        const subsidiary = filters.subsidiary.find(
          (subsidiary: Subsidiary) => subsidiary.id === domain.subsidiaryId
        );

        if (found && subsidiary && domain) {
          form.setValue("region", found.id);
          form.setValue("subsidiary", domain.subsidiary.id);
          setFilteredSubsidiaries(found.subsidiaries);
          setFilteredDomains(subsidiary.domains);
        }
      }
    }
  };

  const onDownload = () => {
    // Simulate download
    console.log("Downloading report...");
  };

  if (!filterData) return;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          defaultValues.current = data;
          setApplyButtonDisabled(true);
          //
          onSubmit(data);
        })}
        className="space-y-5"
      >
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
          {hasDownloadButton && (
            <Button variant="outline" onClick={onDownload}>
              <div className="flex items-center space-x-2 text-zinc-950">
                <Download />
                <span>Download Report</span>
              </div>
            </Button>
          )}
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
              const firstElement = { value: "all", label: "All" };

              let items = [
                firstElement,
                ...value.map((item: { name: string; id: string | number }) => ({
                  label: item.name,
                  value: item.id,
                })),
              ];

              if (key === "subsidiary") {
                items = [
                  firstElement,
                  ...filteredSubsidiaries.map((subsidiary) => ({
                    label: subsidiary.name,
                    value: subsidiary.id,
                  })),
                ];
              }

              if (key === "domain") {
                items = [
                  firstElement,
                  ...filteredDomains.map((domain) => ({
                    label: domain.name,
                    value: domain.id,
                  })),
                ];
              }

              return (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <SelectForm
                      label={formatCamelCaseToTitleCase(key)}
                      width="auto"
                      field={field}
                      items={items}
                      onChange={(id: string | number) => {
                        updateFilters(key, id);
                      }}
                    />
                  )}
                />
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-32"
              disabled={applyButtonDisabled}
            >
              Apply
            </Button>
          </div>
        </FiltersContainer>
      </form>
    </Form>
  );
};

export default Filters;

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
