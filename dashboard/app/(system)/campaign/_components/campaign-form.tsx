'use client';

// React and hooks
import { useStateVariables } from '@/components/provider/state-provider';
import { useState } from 'react';
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
import {
  CustomSelectTrigger,
  DatePickerPopover,
  SelectComponent,
} from './custom-form-items';
import FormComponent from './form-component';
import TableComponent from './table-component';

// Icons
import { Check, CircleHelp } from 'lucide-react';

// Utils and Constants
import { cn } from '@/utils/utils';
import { toast } from 'sonner';
import { isEmpty } from '../../(hub)/cms/_utils/utils';
import { API_ENDPOINTS } from '../constant/contant';

// State Management
import useCampaignState from '../store/campaign-state';

interface CampaignFormProps {
  initialData: any;
  isEditMode?: boolean;
  campaignId?: string;
}

export default function CampaignForm({
  initialData,
  isEditMode = false,
  campaignId,
}: CampaignFormProps) {
  const { campaigns } = useStateVariables();
  const { routeToPage } = useNavigation();
  const { selectedNumberOfStages, setSelectedNumberOfStages } =
    useCampaignState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handlePreventSpace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  // slug 중복체크
  const handleCheckSlug = async () => {
    const isSlugValid = await form.trigger('slug');

    if (!isSlugValid) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.CHECK_SLUG}?slug=${form.getValues('slug')}`
      );
      const result = await response.json();

      if (result.result.available) {
        form.setValue('isSlugChecked', true);
        form.resetField('slug', {
          defaultValue: form.getValues('slug'),
        });
      } else {
        form.setError('slug', { message: 'Slug is already in use' });
      }
    } catch (error) {
      toast.error('Failed to check slug');
    }
  };

  // API 서비스 함수들 (CREATE)
  const campaignService = {
    async createCampaign(data: FormValues) {
      const response = await fetch(API_ENDPOINTS.CAMPAIGN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.certificationName,
          slug: data.slug,
          startedAt: data.startDate,
          endedAt: data.endDate,
          totalStages: Number(data.numberOfStages),
          firstBadgeName: data.firstBadgeName,
          secondBadgeName: data.secondBadgeName,
          ffFirstBadgeStageIndex: Number(data.ffFirstBadgeStage),
          ffSecondBadgeStageIndex: Number(data.ffSecondBadgeStage),
          fsmFirstBadgeStageIndex: Number(data.fsmFirstBadgeStage),
          fsmSecondBadgeStageIndex: Number(data.fsmSecondBadgeStage),
        }),
      });

      // 응답이 성공이 아닌 경우 오류 출력 후 예외 발생
      if (!response.ok) {
        toast.error('Failed to create campaign');
        throw new Error(
          `Request failed createCampaign with status ${response.status}`
        );
      }

      return response.json();
    },

    async copyResources(
      sourceCampaignId: string,
      destinationCampaignId: string,
      type: 'target' | 'image' | 'uiLanguage'
    ) {
      const endpoint = getCopyResourceEndpoint(type);
      if (endpoint === null) {
        alert('Invalid type');
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCampaignId, destinationCampaignId }),
      });
      if (!response.ok) {
        toast.error(`Failed to copy ${type} resources`);
      }
      return response;
    },
  };

  // (CREATE)
  const getCopyResourceEndpoint = (
    type: 'target' | 'image' | 'uiLanguage'
  ): string | null => {
    if (type === 'target') return API_ENDPOINTS.COPY_TARGET;
    if (type === 'image') return API_ENDPOINTS.COPY_IMAGE;
    if (type === 'uiLanguage') return API_ENDPOINTS.COPY_UI_LANG;
    return null;
  };

  // (CREATE)
  const handleCopyResources = async (
    campaignId: string,
    destinationId: string,
    type: 'target' | 'image' | 'uiLanguage'
  ) => {
    try {
      await campaignService.copyResources(campaignId, destinationId, type);
      toast.success(`Copied ${type} resources successfully`);
    } catch (error) {
      toast.error(`Failed to copy ${type} resources`);
      throw error;
    }
  };

  // CREATE Submit
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      const campaignData = await campaignService.createCampaign(data);
      if (!campaignData?.success) {
        console.error('Failed to create campaign', campaignData);
        toast.error('Failed to create campaign');
        return;
      }

      console.warn('complete campaign');
      const campaign = campaignData.result.campaign;
      const campaignSettings = campaignData.result.campaignSettings;

      console.warn('campaign:', campaign);
      console.warn('campaignSettings:', campaignSettings);

      const copyPromises = [];
      if (data.targetSourceCampaignId) {
        copyPromises.push(
          handleCopyResources(
            data.targetSourceCampaignId,
            campaign.id,
            'target'
          )
        );
      }
      if (data.imageSourceCampaignId) {
        copyPromises.push(
          handleCopyResources(data.imageSourceCampaignId, campaign.id, 'image')
        );
      }
      if (data.uiLanguageSourceCampaignId) {
        copyPromises.push(
          handleCopyResources(
            data.uiLanguageSourceCampaignId,
            campaign.id,
            'uiLanguage'
          )
        );
      }

      await Promise.all(copyPromises);
      toast.success('Certification created successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(' An error occurred while creating the campaign.');
    } finally {
      console.warn('loading end');
      setIsLoading(false);
      setIsDialogOpen(false);
      routeToPage('/campaign');
    }
  };

  // EDIT Submit
  // TODO: editSubmit 수정 필요
  const editSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/cms/campaign/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          name: data.certificationName,
          startedAt: data.startDate,
          endedAt: data.endDate,
          totalStages: Number(data.numberOfStages),
          firstBadgeName: data.firstBadgeName,
          secondBadgeName: data.secondBadgeName,
          ffFirstBadgeStageIndex: Number(data.ffFirstBadgeStage),
          ffSecondBadgeStageIndex: Number(data.ffSecondBadgeStage),
          fsmFirstBadgeStageIndex: Number(data.fsmFirstBadgeStage),
          fsmSecondBadgeStageIndex: Number(data.fsmSecondBadgeStage),
        }),
      });

      console.log('🥕 response', response);
    } catch (error) {
    } finally {
      setIsLoading(false);
      // routeToPage('/campaign');
    }
  };

  const inputStyle =
    'border-zinc-200 shadow-none h-full max-h-10 p-3 text-size-14px text-zinc-500 disabled:bg-zinc-200 placeholder:text-zinc-500';

  return (
    <div className="w-full m-6">
      <h2 className="text-size-17px font-semibold">
        {isEditMode ? 'Edit' : 'Create'} Certification
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(isEditMode ? editSubmit : onSubmit)}
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
                            form.formState.errors.certificationName?.message &&
                              'border-destructive'
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
                              readOnly={isEditMode ? true : false}
                              value={
                                isEditMode ? initialData?.slug : field.value
                              }
                              placeholder={isEditMode ? 'enter-name' : ''}
                              onKeyDown={handlePreventSpace}
                              onChange={(e) => {
                                field.onChange(e);
                                if (form.getFieldState('slug').isDirty) {
                                  form.setValue('isSlugChecked', false);
                                }
                              }}
                            />
                          </div>
                          {!isEditMode && (
                            <Button
                              variant={'secondary'}
                              className={cn(
                                'absolute left-[20rem] border-zinc-200 shadow-none ml-5 text-size-14px w-[7.125rem] h-10 font-normal text-zinc-500 text-center',
                                !form.getFieldState('slug').isDirty &&
                                  form.getValues('isSlugChecked') &&
                                  'text-green-600 border-green-600'
                              )}
                              type="button"
                              disabled={isEmpty(form.getValues('slug'))}
                              onClick={handleCheckSlug}
                            >
                              Check
                              {!form.getFieldState('slug').isDirty &&
                                form.getValues('isSlugChecked') && (
                                  <Check className="text-green-600" />
                                )}
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      {form.getValues('slug') &&
                      !form.getValues('isSlugChecked') ? (
                        <FormMessage>
                          {form.formState.errors.isSlugChecked?.message}
                        </FormMessage>
                      ) : (
                        <FormMessage />
                      )}
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
                      <DatePickerPopover
                        error={form.formState.errors.startDate?.message}
                        field={field}
                      />
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
                      <DatePickerPopover
                        error={form.formState.errors.endDate?.message}
                        field={field}
                      />
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
                render={(field) => (
                  <SelectComponent
                    field={field}
                    selectDefaultValue="None"
                    disabled={isEditMode ? true : false}
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
                    selectDefaultValue="None"
                    disabled={isEditMode ? true : false}
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
                    selectDefaultValue="None"
                    disabled={isEditMode ? true : false}
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
                  <SelectValue
                    placeholder={
                      isEditMode ? initialData?.numberOfStages : 'Select'
                    }
                  />
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
              className="max-w-[20rem]"
              form={form}
              label="First Badge Name"
              name="firstBadgeName"
              render={(field) => (
                <Input
                  {...field}
                  disabled={selectedNumberOfStages === undefined}
                  placeholder="Expert"
                  value={isEditMode ? initialData?.firstBadgeName : field.value}
                  className={cn(
                    inputStyle,
                    form.formState.errors.firstBadgeName?.message &&
                      'border-destructive'
                  )}
                />
              )}
            />
            <FormComponent
              className="max-w-[20rem]"
              form={form}
              label="Second Badge Name"
              name="secondBadgeName"
              render={(field) => (
                <Input
                  {...field}
                  disabled={selectedNumberOfStages === undefined}
                  placeholder="Advanced"
                  value={
                    isEditMode ? initialData?.secondBadgeName : field.value
                  }
                  className={cn(inputStyle)}
                />
              )}
            />
          </Container>
          <TableComponent
            form={form}
            isEditMode={isEditMode}
            initialData={initialData}
          />
        </form>
      </Form>
      <div className="flex justify-center mt-16 gap-3">
        <Button variant="secondary" onClick={() => routeToPage('/campaign')}>
          Cancel
        </Button>

        {form.formState.isValid && !isEditMode ? (
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
                  Media to Copy, Target to Copy, or UI Language to Copy. Are you
                  sure you want to save?
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
  );
}
