'use client';
// React and hooks
import { useStateVariables } from '@/components/provider/state-provider';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '../../(hub)/cms/_hooks/useNavigation';
// Form related
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormValues } from '../_type/formSchema';
// UI Components
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
// Custom Components
import Container from './container';
import { CustomSelectTrigger, SelectComponent } from './custom-form-items';
import FormComponent from './form-component';
import TableComponent from './table-component';
// Icons
import { CalendarIcon, CircleHelp } from 'lucide-react';
// Utils and Constants
import { cn } from '@/utils/utils';
import { toast } from 'sonner';
import { isEmpty } from '../../(hub)/cms/_utils/utils';
// State Management
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import useCampaignState from '../store/campaign-state';
import { LoadingFullScreen } from '@/components/loader';
import { mutate } from 'swr';

interface CampaignFormProps {
  initialData: any;
  campaignId?: string;
}

export default function CampaignEditForm({
  initialData,
  campaignId,
}: CampaignFormProps) {
  const { campaigns, role } = useStateVariables();
  const { routeToPage } = useNavigation();
  const { setSelectedNumberOfStages } = useCampaignState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  const watchForm = form.watch();

  useEffect(() => {
    // 현재 에러 상태 확인
    const hasStartDateError = !!form.formState.errors.startDate;
    const hasEndDateError = !!form.formState.errors.endDate;

    // 날짜 유효성 검사 - startDate와 endDate가 모두 존재할 때
    if (watchForm.startDate && watchForm.endDate) {
      const startDate = new Date(watchForm.startDate);
      const endDate = new Date(watchForm.endDate);

      // startDate가 endDate보다 늦은 경우
      if (startDate > endDate) {
        if (!hasStartDateError) {
          form.setError('startDate', {
            message: 'Start Date must be earlier than End Date',
          });
        }
        if (!hasEndDateError) {
          form.setError('endDate', {
            message: 'End Date must be later than Start Date',
          });
        }
      } else {
        // 날짜가 올바른 순서인 경우 에러 제거
        if (hasStartDateError) {
          form.clearErrors('startDate');
        }
        if (hasEndDateError) {
          form.clearErrors('endDate');
        }
      }
    }

    // Cleanup function
    return () => {
      // 컴포넌트 언마운트 시에만 에러 클리어
    };
  }, [
    watchForm,
    form,
    form.formState.errors.startDate,
    form.formState.errors.endDate,
  ]);

  useEffect(() => {
    setSelectedNumberOfStages(initialData.numberOfStages);
  }, []);

  const handlePreventSpace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  // EDIT Submit
  const editSubmit = async (data: any) => {
    setIsLoading(true);

    const requestBody: Record<string, any> = {
      campaignId: campaignId,
      name: data.certificationName,
      startedAt: data.startDate,
      endedAt: data.endDate,
    };

    try {
      const response = await fetch(`/api/cms/campaign/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const campaignData = await response.json();
      console.log('🥕 campaignData', campaignData);

      if (!campaignData?.success) {
        console.error('Failed to create campaign', campaignData);
        toast.error('Failed to create campaign');
        return;
      }

      console.warn('update campaign');

      await mutate(`/api/cms/campaign?role=${role?.name || 'ADMIN'}`);
      await mutate(`/api/cms/campaign/${campaignId}`);
      toast.success('Campaign updated successfully!');
      routeToPage('/campaign');
    } catch (error) {
      toast.error(`Failed to update campaign: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle =
    'border-zinc-200 shadow-none h-full max-h-10 p-3 text-size-14px text-zinc-500 disabled:bg-zinc-200 placeholder:text-zinc-500';

  return (
    <>
      <div className="w-full m-6">
        <h2 className="text-size-17px font-semibold">Edit Certification</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(editSubmit)}
            id="certification-form"
            className="space-y-8 mx-auto w-full max-w-[46.25rem] pt-16"
          >
            <span className="font-semibold">Basic Info</span>
            <div className="grid grid-rows-3 min-[880px]:grid-rows-4 gap-8">
              <Container>
                <FormField
                  control={form.control}
                  name="certificationName"
                  render={({ field }) => {
                    return (
                      <FormItem className="max-w-[20rem]">
                        <FormLabel>Certification Name</FormLabel>
                        <FormControl>
                          <Input
                            className={cn(
                              inputStyle,
                              form.formState.errors.certificationName
                                ?.message && 'border-destructive'
                            )}
                            {...field}
                            onKeyDown={handlePreventSpace}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => {
                    return (
                      <FormItem className="">
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <div className="flex relative w-fit">
                            <div className="max-w-[20rem] flex items-center">
                              <p className="text-size-12px text-zinc-500 underline h-10 px-3 leading-[2.5rem] border border-r-0 border-zinc-200 bg-zinc-50 rounded-l-md">
                                https://www.samsungplus.net/
                              </p>
                              <Input
                                className={cn(
                                  'rounded-s-none flex-grow read-only:bg-zinc-200',
                                  inputStyle,
                                  form.formState.errors.slug?.message &&
                                    'border-destructive'
                                )}
                                {...field}
                                readOnly
                                value={initialData?.slug}
                              />
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
              </Container>
              <Container>
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full max-w-[20rem] ">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Popover
                          open={startDatePickerOpen}
                          onOpenChange={setStartDatePickerOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant={'secondary'}
                              className={cn(
                                'max-w-[20rem] max-h-10 w-full h-full justify-start py-3 items-center shadow-none text-left font-normal ',
                                !field.value && 'text-muted-foreground',
                                form.formState.errors.startDate?.message &&
                                  'border-destructive'
                              )}
                            >
                              <CalendarIcon />
                              {field.value ? (
                                format(field.value as Date, 'PPP')
                              ) : (
                                <span className="font-medium">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 " align="start">
                            <Calendar
                              mode="single"
                              selected={field.value as Date}
                              onSelect={(date) => {
                                field.onChange(date);
                                setStartDatePickerOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Popover
                          open={endDatePickerOpen}
                          onOpenChange={setEndDatePickerOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant={'secondary'}
                              className={cn(
                                'max-w-[20rem] max-h-10 w-full h-full justify-start py-3 items-center shadow-none text-left font-normal ',
                                !field.value && 'text-muted-foreground',
                                form.formState.errors.startDate?.message &&
                                  'border-destructive'
                              )}
                            >
                              <CalendarIcon />
                              {field.value ? (
                                format(field.value as Date, 'PPP')
                              ) : (
                                <span className="font-medium">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 " align="start">
                            <Calendar
                              mode="single"
                              selected={field.value as Date}
                              onSelect={(date) => {
                                field.onChange(date);
                                setEndDatePickerOpen(false);
                              }}
                              fromDate={form.getValues('startDate')}
                              disabled={(date) =>
                                date < form.getValues('startDate')
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Container>
              <Container>
                <FormComponent
                  form={form}
                  className="max-w-[20rem]"
                  label="Media to Copy (Optional)"
                  name="imageSourceCampaignId"
                  type="tooltip"
                  description="The media data used in the selected certification will be copied."
                  trigger={
                    <CircleHelp className="size-3 text-secondary cursor-pointer" />
                  }
                  render={(field) => {
                    return (
                      <SelectComponent
                        field={field}
                        selectDefaultValue={initialData.copyMedia || 'None'}
                        disabled
                      >
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {campaigns &&
                            campaigns.map((campaign) => (
                              <SelectItem value={campaign.id} key={campaign.id}>
                                {campaign.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </SelectComponent>
                    );
                  }}
                />
                <FormComponent
                  form={form}
                  className="max-w-[20rem]"
                  label="Target to Copy (Optional)"
                  name="targetSourceCampaignId"
                  type="tooltip"
                  description="The Target data used in the selected certification will be copied."
                  trigger={
                    <CircleHelp className="size-3 text-secondary cursor-pointer" />
                  }
                  render={(field) => (
                    <SelectComponent
                      field={field}
                      selectDefaultValue={initialData.copyTarget || 'None'}
                      disabled
                    >
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {campaigns &&
                          campaigns.map((campaign) => (
                            <SelectItem value={campaign.id} key={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </SelectComponent>
                  )}
                />
              </Container>
              <div className="h-fit">
                <FormComponent
                  className="max-w-[20rem]"
                  form={form}
                  label="UI Language to Copy (Optional)"
                  name="uiLanguageSourceCampaignId"
                  type="tooltip"
                  description="The UI Language data used in the selected certification will be copied."
                  trigger={
                    <CircleHelp className="size-3 text-secondary cursor-pointer" />
                  }
                  render={(field) => (
                    <SelectComponent
                      field={field}
                      selectDefaultValue={initialData.copyUiLanguage || 'None'}
                      disabled
                    >
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {campaigns &&
                          campaigns.map((campaign) => (
                            <SelectItem value={campaign.id} key={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </SelectComponent>
                  )}
                />
              </div>
            </div>
            <Separator />
            <p className="font-semibold">Stage Setting</p>
            <FormComponent
              form={form}
              label="Number of Stages"
              name="numberOfStages"
              render={(field) => (
                <Select
                  disabled
                  defaultValue={field.value as string}
                  onValueChange={(value) => {
                    setSelectedNumberOfStages(value);
                    field.onChange(value);
                  }}
                >
                  <CustomSelectTrigger
                    className={cn(
                      'w-[20rem]',
                      form.formState.errors.numberOfStages?.message &&
                        'border-destructive'
                    )}
                  >
                    <SelectValue placeholder={initialData?.numberOfStages} />
                  </CustomSelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <SelectItem value={`${index}`} key={index}>
                        {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Separator />
            <p className="font-medium">Badge Setting</p>
            <Container className="space-x-0 min-[880px]:space-x-[3.125rem]">
              <FormComponent
                className="max-w-[20rem] "
                form={form}
                label="First Badge Name"
                name="firstBadgeName"
                render={(field) => (
                  <Input
                    {...field}
                    disabled
                    value={field.value}
                    className={cn(
                      inputStyle,
                      form.formState.errors.firstBadgeName?.message &&
                        'border-destructive',
                      'placeholder:text-slate-300'
                    )}
                  />
                )}
              />
              <FormComponent
                className="max-w-[20rem]"
                form={form}
                label="Second Badge Name"
                name="secondBadgeName"
                render={(field) => {
                  return (
                    <Input
                      {...field}
                      disabled
                      placeholder="Advanced"
                      value={field.value}
                      className={cn(
                        inputStyle,
                        form.formState.errors.secondBadgeName?.message &&
                          'border-destructive',
                        'placeholder:text-slate-300'
                      )}
                    />
                  );
                }}
              />
            </Container>
            <TableComponent
              form={form}
              isEditMode={true}
              initialData={initialData}
            />
          </form>
        </Form>
        <div className="flex justify-center mt-16 gap-3">
          <Button variant="secondary" onClick={() => routeToPage('/campaign')}>
            Cancel
          </Button>

          {form.formState.isValid ? (
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="action" form="certification-form">
                  Save
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="p-4 gap-[2.125rem] sm:rounded-md border border-zinc-200 max-w-[27.063rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base font-medium text-left">
                    Alert
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-size-14px text-zinc-500 text-left">
                    Once you create a certification, you cannot change the Slug,
                    Media to Copy, Target to Copy, or UI Language to Copy. Are
                    you sure you want to save?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="!flex-row !justify-center items-center !space-x-0 gap-3">
                  <AlertDialogCancel
                    className={cn(buttonVariants({ variant: 'secondary' }))}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button variant="action" form="certification-form">
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              variant="action"
              form="certification-form"
              disabled={isEmpty(form.formState.dirtyFields) || isLoading}
            >
              Save
            </Button>
          )}
        </div>
      </div>
      {isLoading && <LoadingFullScreen />}
    </>
  );
}
