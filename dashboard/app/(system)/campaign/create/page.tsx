'use client';
// External libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CircleHelp } from 'lucide-react';

// UI Components
import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Custom Components
import { CustomAlertDialog } from '../../(hub)/cms/_components/custom-alert-dialog';
import Container from '../_components/create-certification/container';
import FormComponent from '../_components/create-certification/form-component';
import {
  CustomInput,
  CustomPopover,
  CustomSelect,
} from '../_components/create-certification/custom-form-items';
import TableComponent from '../_components/create-certification/table-component';

// Hooks & State
import { useNavigation } from '../../(hub)/cms/_hooks/useNavaigation';
import { useStateVariables } from '@/components/provider/state-provider';

// Types & Schema
import { defaultValues, formSchema, FormValues } from './_type/formSchema';
import { isEmpty } from '../../(hub)/cms/_utils/utils';
import useCampaignState from '../store/campaign-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  const { campaigns } = useStateVariables();
  const { routeToPage } = useNavigation();
  const { selectedNumberOfStages, setSelectedNumberOfStages } =
    useCampaignState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  // API URL
  const API_ENDPOINTS = {
    CAMPAIGN: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign`,
    CHECK_SLUG: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign/check-slug`,
    COPY_TARGET: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/resource/target/copy`,
    COPY_IMAGE: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/resource/image/copy`,
  } as const;

  // API 서비스 함수들
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
      type: 'target' | 'image'
    ) {
      const endpoint =
        type === 'target'
          ? API_ENDPOINTS.COPY_TARGET
          : API_ENDPOINTS.COPY_IMAGE;
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

  const handleCopyResources = async (
    campaignId: string,
    destinationId: string,
    type: 'target' | 'image'
  ) => {
    try {
      await campaignService.copyResources(campaignId, destinationId, type);
      toast.success(`Copied ${type} resources successfully`);
    } catch (error) {
      toast.error(`Failed to copy ${type} resources`);
      throw error;
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      const campaignData = await campaignService.createCampaign(data);
      console.log('🥕 campaignData:', campaignData);
      if (!campaignData?.success) {
        console.error('Failed to create campaign', campaignData);
        toast.error('Failed to create campaign');
        return;
      }

      console.warn('complete campaign');
      const campaign = campaignData.campaign;
      const campaignSettings = campaignData.campaignSettings;
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
        if (data.imageSourceCampaignId) {
          copyPromises.push(
            handleCopyResources(
              data.targetSourceCampaignId,
              campaign.id,
              'image'
            )
          );
        }
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

  return (
    <>
      <div className="w-full mb-6">
        <h2 className="text-size-17px font-semibold">Create Certification</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="certification-form"
            className="space-y-8 mx-auto w-full max-w-[52.375rem] pt-16"
          >
            <span className="font-semibold">Basic Info</span>
            <div className="grid grid-rows-3 min-[880px]:grid-rows-4 gap-8">
              <Container>
                <FormComponent
                  className="max-w-[20rem]"
                  form={form}
                  label="Certification Name"
                  name="certificationName"
                  render={(field) => (
                    <CustomInput
                      {...field}
                      props={{
                        placeholder: 'Enter Name',
                      }}
                    />
                  )}
                />
                <FormComponent
                  form={form}
                  label="Slug"
                  name="slug"
                  render={(field) => (
                    <div className="flex">
                      <div className="flex items-center  max-w-[20rem]">
                        <p className="text-size-12px text-zinc-500 underline h-10 px-3 leading-[2.5rem] border border-r-0 border-zinc-200 bg-zinc-50 rounded-l-md">
                          https://www.samsungplus.net/
                        </p>
                        <CustomInput
                          className="rounded-s-none"
                          {...field}
                          props={{
                            placeholder: 'enter-name',
                            onChange: (e) => {
                              field.onChange(e);
                              if (form.getFieldState('slug').isDirty) {
                                form.setValue('isSlugChecked', false);
                              }
                            },
                          }}
                        />
                      </div>

                      <Button
                        variant={'secondary'}
                        className="border-zinc-200 shadow-none ml-5 text-size-14px h-10 font-normal text-zinc-500"
                        type="button"
                        disabled={isEmpty(form.getValues('slug'))}
                        onClick={handleCheckSlug}
                      >
                        Check
                        {!form.getFieldState('slug').isDirty &&
                          form.getValues('isSlugChecked') && <Check />}
                      </Button>
                    </div>
                  )}
                />
              </Container>
              <Container>
                <FormComponent
                  className="flex flex-col w-full max-w-[20rem]"
                  form={form}
                  label="Start Date"
                  name="startDate"
                  render={(field) => <CustomPopover field={field} />}
                />
                <FormComponent
                  className="w-full flex flex-col"
                  form={form}
                  label="End Date"
                  name="endDate"
                  render={(field) => <CustomPopover field={field} />}
                />
              </Container>
              <Container>
                <FormComponent
                  form={form}
                  className="max-w-[20rem]"
                  label="Media to Copy (Optional)"
                  name="imageSourceCampaignId"
                  type="tooltip"
                  render={(field) => (
                    <CustomSelect field={field} selectDefaultValue="None">
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {campaigns &&
                          campaigns.map((campaign) => (
                            <SelectItem value={campaign.id} key={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </CustomSelect>
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
                    <CustomSelect field={field} selectDefaultValue="None">
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {campaigns &&
                          campaigns.map((campaign) => (
                            <SelectItem value={campaign.id} key={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </CustomSelect>
                  )}
                />
              </Container>
              <div className="h-fit">
                <FormComponent
                  className="max-w-[20rem]"
                  form={form}
                  label="UI Language to Copy (Optional)"
                  name="copyUiLanguage"
                  type="tooltip"
                  render={(field) => (
                    <CustomSelect field={field} selectDefaultValue="None">
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {campaigns &&
                          campaigns.map((campaign) => (
                            <SelectItem value={campaign.id} key={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </CustomSelect>
                  )}
                />
              </div>
            </div>
            <Separator />
            <p className="font-semibold">Stage Setting</p>
            <FormField
              control={form.control}
              name="numberOfStages"
              render={({ field }) => {
                return (
                  <Select
                    onValueChange={(value) => {
                      setSelectedNumberOfStages(value);
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <SelectItem value={`${index}`} key={index}>
                          {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            <Separator />
            <p className="font-medium">Badge Setting</p>
            <Container>
              <FormComponent
                className="max-w-[20rem]"
                form={form}
                label="First Badge Name"
                name="firstBadgeName"
                render={(field) => (
                  <CustomInput
                    {...field}
                    props={{
                      disabled: selectedNumberOfStages === undefined,
                      placeholder: 'Expert',
                    }}
                  />
                )}
              />
              <FormComponent
                className="max-w-[20rem]"
                form={form}
                label="Second Badge Name"
                name="secondBadgeName"
                render={(field) => (
                  <CustomInput
                    {...field}
                    props={{
                      disabled: selectedNumberOfStages === undefined,
                      placeholder: 'Advanced',
                    }}
                  />
                )}
              />
            </Container>
            <TableComponent form={form} />
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
            <Button variant="action" form="certification-form">
              Save
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
