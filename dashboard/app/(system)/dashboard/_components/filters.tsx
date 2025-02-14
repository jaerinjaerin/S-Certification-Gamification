'use client';
import SelectForm from '@/components/system/select-with-title';
import { Button } from '@/components/ui/button';
import FiltersContainer from '@/components/system/filters-container';
import {
  ControllerRenderProps,
  FieldValues,
  useForm,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { formatCamelCaseToTitleCase } from '@/lib/text';
import { CalendarForm } from '@/components/system/calendar-with-title';
import { ToggleUserButtons } from '@/components/system/toggle-buttons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import Loader from '@/components/loader';
import { useSearchParams } from 'next/navigation';

// 데이터 초기화 인터페이스
type InitializeFiltersPros = (
  filters: FilterData,
  form: UseFormReturn,
  setFilteredSubsidiaries: Dispatch<SetStateAction<Subsidiary[]>>,
  setFilteredDomains: Dispatch<SetStateAction<Subsidiary[]>>
) => void;

// 데이터 초기화 함수
const initializeFilters: InitializeFiltersPros = (
  filters,
  form,
  setFilteredSubsidiaries,
  setFilteredDomains
) => {
  // 모든 필터를 "all"로 설정
  Object.entries(filters).forEach(([key]) => {
    form.setValue(key, 'all');
  });

  // 종속 데이터 업데이트
  setFilteredSubsidiaries(filters.subsidiary);
  setFilteredDomains(filters.domain);
};

const firstElement = { value: 'all', label: 'All' };

// 렌더 데이터 시작
const Filters = ({
  onDownload,
  onSubmit,
}: {
  onDownload?: (data: FieldValues) => void;
  onSubmit: (data: FieldValues, action?: boolean) => void;
}) => {
  const searchParams = useSearchParams();
  const form = useForm();
  const formValues = useWatch({ control: form.control });
  const [filterData, setFilterData] = useState<AllFilterData | null>(null);
  const [filteredSubsidiaries, setFilteredSubsidiaries] = useState<
    Subsidiary[]
  >([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const defaultValues = useRef<FieldValues | null>(null);
  const [applyButtonDisabled, setApplyButtonDisabled] = useState<boolean>(true);

  // 필터 데이터 불러오기기
  useEffect(() => {
    axios.get('/api/dashboard/filter').then((res) => {
      setFilterData(res.data);
    });
  }, []);

  useEffect(() => {
    if (filterData && !defaultValues.current) {
      if (searchParams) {
        searchParams.forEach((value, key) => {
          if (!key.includes('date')) {
            form.setValue(key, value);
          }
        });
        //

        // date 설정
        if (searchParams.get('date.from') && searchParams.get('date.to')) {
          const fromDate = searchParams.get('date.from');
          const toDate = searchParams.get('date.to');

          if (fromDate && toDate) {
            form.setValue('date', {
              from: new Date(fromDate),
              to: new Date(toDate),
            });
          }
        }
        //

        // 지역 셀렉트 박스 설정
        const priorities = ['domain', 'subsidiary', 'region']; // 우선순위 설정
        let isUpdated = false; // 플래그 변수 설정

        for (const k of priorities) {
          if (searchParams.get(k) && searchParams.get(k) !== 'all') {
            if (!isUpdated) updateFilters(k, searchParams.get(k) as string); // 조건을 만족하면 updateFilters 호출
            isUpdated = true; // 플래그 설정
            break; // 한 번 실행 후 루프 종료
          }
        }

        if (!isUpdated) {
          initializeFilters(
            filterData.filters,
            form,
            setFilteredSubsidiaries,
            setFilteredDomains
          );
        }
        //
        // 적용버튼 활성화 기능을 위한 기준정보 저장
        defaultValues.current = form.getValues();

        // reducer에 알림
        onSubmit(form.getValues());
      } else {
        // 필터 초기화 호출
        initializeFilters(
          filterData.filters,
          form,
          setFilteredSubsidiaries,
          setFilteredDomains
        );

        // 캠페인 초기화
        if (filterData.campaign.length > 0) {
          const campaign = filterData.campaign[0];
          form.setValue('campaign', campaign.id);
          form.setValue('date', {
            from: new Date(campaign.startedAt),
            to: new Date(campaign.endedAt),
          });
        }
        //
        // 유저 선택 초기화
        form.setValue('userGroup', 'all');
        //
        // 적용버튼 활성화 기능을 위한 기준정보 저장
        defaultValues.current = form.getValues();

        // reducer에 알림
        onSubmit(form.getValues());
      }
    }
  }, [form, filterData, onSubmit, searchParams]);

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

    const isRegion = key === 'region';
    const isSubsidiary = key === 'subsidiary';
    const isDomain = key === 'domain';

    if (isRegion) {
      if (id === 'all') {
        form.setValue('subsidiary', 'all');
        form.setValue('domain', 'all');
        setFilteredSubsidiaries(filters.subsidiary);
        setFilteredDomains(filters.domain);
      } else {
        const found = filters.region.find((region) => region.id === id);
        if (found) {
          form.setValue('subsidiary', 'all');
          form.setValue('domain', 'all');
          setFilteredSubsidiaries(found.subsidiaries);
          setFilteredDomains(found.domains);
        }
      }
    } else if (isSubsidiary) {
      if (id === 'all') {
        const found = filters.region.find(
          (region) => region.id === form.getValues().region
        );
        //
        if (found) {
          form.setValue('region', found.id);
          form.setValue('domain', 'all');
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
          form.setValue('region', found.id);
          form.setValue('domain', 'all');
          setFilteredSubsidiaries(found.subsidiaries);
          setFilteredDomains(subsidiary.domains);
        }
      }
    } else if (isDomain) {
      if (id === 'all') {
        return;
      } else {
        const found = filters.region.find((region) =>
          region.domains.some((domain: Domain) => domain.id === id)
        );

        const domain = filters.domain.find((domain) => domain.id === id);

        const subsidiary = filters.subsidiary.find(
          (subsidiary: Subsidiary) => subsidiary.id === domain?.subsidiaryId
        );

        if (found && subsidiary && domain) {
          form.setValue('region', found.id);
          form.setValue('subsidiary', domain.subsidiary.id);
          setFilteredSubsidiaries(found.subsidiaries);
          setFilteredDomains(subsidiary.domains);
        }
      }
    }
  };

  const selectCampaign = (id: string | number) => {
    if (!filterData) return;

    const found = filterData.campaign.find((campaign) => campaign.id === id);

    const date = {
      from: new Date(found.startedAt),
      to: new Date(found.endedAt),
    };
    form.setValue('date', date);
    form.setValue('userGroup', 'all');

    // 필터 초기화 호출
    initializeFilters(
      filterData.filters,
      form,
      setFilteredSubsidiaries,
      setFilteredDomains
    );

    defaultValues.current = form.getValues();
    onSubmit(form.getValues());
  };

  if (!filterData)
    return (
      <FiltersContainer>
        <Loader className="w-full flex items-center justify-center" />
      </FiltersContainer>
    );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          defaultValues.current = data;
          setApplyButtonDisabled(true);
          //
          onSubmit(data, true);
        })}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="campaign"
            defaultValue={
              searchParams.get('campaign') || filterData.campaign[0].id
            }
            render={({ field }) => (
              <CampaignSelectForm
                field={field}
                items={filterData.campaign.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                onChange={selectCampaign}
              />
            )}
          />
          {onDownload && (
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                onDownload(form.getValues());
              }}
            >
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
                from: new Date(
                  searchParams.get('date.from') ||
                    filterData.campaign[0].startedAt
                ),
                to: new Date(
                  searchParams.get('date.to') || filterData.campaign[0].endedAt
                ),
              }}
              render={({ field }) => {
                return (
                  <CalendarForm
                    field={field}
                    minDate={
                      new Date(
                        searchParams.get('date.from') ||
                          filterData.campaign[0].startedAt
                      )
                    }
                    maxDate={
                      new Date(
                        searchParams.get('date.to') ||
                          filterData.campaign[0].endedAt
                      )
                    }
                  />
                );
              }}
            />
            <FormField
              control={form.control}
              name="userGroup"
              defaultValue={searchParams.get('userGroup') || 'all'}
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
            {Object.entries(filterData.filters)
              .slice(0, 3)
              .map(([key, value]) => {
                let items = [
                  firstElement,
                  ...value.map(
                    (item: { name: string; id: string | number }) => ({
                      label: item.name,
                      value: item.id,
                    })
                  ),
                ];

                if (key === 'subsidiary') {
                  items = [
                    firstElement,
                    ...filteredSubsidiaries.map((subsidiary) => ({
                      label: subsidiary.name,
                      value: subsidiary.id,
                    })),
                  ];
                }

                if (key === 'domain') {
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
                    defaultValue={searchParams.get(key) || 'all'}
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
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-x-10 gap-y-7">
              {Object.entries(filterData.filters)
                .slice(3, 6)
                .map(([key, value]) => {
                  const items = [
                    firstElement,
                    ...value.map(
                      (item: { name: string; id: string | number }) => ({
                        label: item.name,
                        value: item.id,
                        meta: item,
                      })
                    ),
                  ];

                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key}
                      defaultValue={searchParams.get(key) || 'all'}
                      render={({ field }) => (
                        <SelectForm
                          label={formatCamelCaseToTitleCase(key)}
                          width="auto"
                          field={field}
                          items={items}
                          // onChange={(id: string | number) => {
                          // updateFilters(key, id);
                          // }}
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
  onChange,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  items: { label: string; value: string | number }[];
  onChange?: (value: string | number) => void;
}) => {
  return (
    <Select
      onValueChange={(value) => {
        field.onChange(value);
        onChange?.(value);
      }}
      defaultValue={field.value}
    >
      <SelectTrigger
        className={cn(
          'w-auto space-x-3 shadow-none bg-white hover:bg-zinc-100 border-0 hover:bg-transparent focus:bg-transparent focus:ring-0 focus:outline-none !text-size-20px font-bold',
          !field.value && 'text-muted-foreground'
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
