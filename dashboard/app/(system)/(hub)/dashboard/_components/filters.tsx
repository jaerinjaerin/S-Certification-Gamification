/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import FiltersContainer from '@/components/system/filters-container';
import { FieldValues, useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { formatCamelCaseToTitleCase } from '@/lib/text';
import { CalendarForm } from '@/components/system/calendar-with-title';
import { ToggleUserButtons } from '@/components/system/toggle-buttons';
import { Download } from 'lucide-react';
import Loader from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import SelectForm from '@/components/system/select-with-title';
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

const setRolePermission = (
  form: UseFormReturn,
  filters: FilterData,
  role: any | null
) => {
  if (!role) return;
  //
  // 도메인 필터링
  const domain: Domain = filters.domain.find(
    (fd: Domain) => fd.id === role.permissions[0].permission.domains[0].id
  );
  if (domain) {
    const region = domain?.region || { id: domain.id };
    const subsidiary = domain?.subsidiary || { id: domain.id };

    // 권한 제한
    form.setValue('region', region.id);
    form.setValue('subsidiary', subsidiary.id);
    form.setValue('domain', domain.id);
  }
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
  const { filter, role, campaign } = useStateVariables();
  const [filterData, setFilterData] = useState<AllFilterData | null>(null);
  const form = useForm();
  const formValues = useWatch({ control: form.control });
  const [filteredSubsidiaries, setFilteredSubsidiaries] = useState<
    Subsidiary[]
  >([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const defaultValues = useRef<FieldValues | null>(null);
  const [applyButtonDisabled, setApplyButtonDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (!filter) return;

    setFilterData(filter);

    // role이 있을 경우 권한에 맞는 데이터 세팅
    if (role) {
      setRolePermission(form, filter.filters, role);
    }
  }, [filter, role]);

  useEffect(() => {
    if (!filterData || defaultValues.current) return;

    if (searchParams.size > 0) {
      const priorities = ['domain', 'subsidiary', 'region']; // 필터 우선순위
      let isUpdated = false;

      searchParams.forEach((value, key) => {
        if (!key.includes('date') && (!role || !priorities.includes(key))) {
          form.setValue(key, value);
        }
      });

      // 권한 내의 값 강제 적용 (외부 URL에서 변경 방지)
      if (role) {
        setRolePermission(form, filterData.filters, role);
      }

      // 날짜 설정
      const fromDate = searchParams.get('date.from');
      const toDate = searchParams.get('date.to');
      if (fromDate && toDate) {
        form.setValue('date', {
          from: new Date(fromDate),
          to: new Date(toDate),
        });
      }

      // form 데이터 기반 필터 설정
      for (const key of priorities) {
        const value = form.watch(key);
        if (value && value !== 'all') {
          if (!isUpdated) updateFilters(key, value as string);
          isUpdated = true;
          break;
        }
      }

      if (!isUpdated) {
        if (role) {
          Object.entries(filterData.filters).forEach(([key, value]) => {
            if (priorities.includes(key)) {
              form.setValue(key, value[0].id);
            }
          });

          updateFilters('domain', role.permissions[0].permission.domains[0].id);
        } else {
          initializeFilters(
            filterData.filters,
            form,
            setFilteredSubsidiaries,
            setFilteredDomains
          );
        }
      }

      // 기준 정보 저장
      defaultValues.current = form.getValues();
      onSubmit(form.getValues());
    } else {
      initializeFilters(
        filterData.filters,
        form,
        setFilteredSubsidiaries,
        setFilteredDomains
      );
      form.setValue('userGroup', 'all');

      // 기준 정보 저장
      defaultValues.current = form.getValues();
      onSubmit(form.getValues());
    }
  }, [form, filterData, onSubmit, searchParams, role]);

  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;

    const comparison =
      JSON.stringify(formValues) === JSON.stringify(defaultValues.current);
    setApplyButtonDisabled(comparison);
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
          <div className="text-size-20px font-bold">{campaign?.name}</div>
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
                    campaign?.startedAt ||
                    new Date()
                ),
                to: new Date(
                  searchParams.get('date.to') || campaign?.endedAt || new Date()
                ),
              }}
              render={({ field }) => {
                return (
                  <CalendarForm
                    field={field}
                    minDate={
                      new Date(
                        searchParams.get('date.from') ||
                          campaign?.startedAt ||
                          new Date()
                      )
                    }
                    maxDate={
                      new Date(
                        searchParams.get('date.to') ||
                          campaign?.endedAt ||
                          new Date()
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
                        disabled={!!role}
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
