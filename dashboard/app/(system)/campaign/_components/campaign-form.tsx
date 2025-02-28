'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { defaultValues, formSchema, FormValues } from '../_type/formSchema';
import Container from './container';
import FormComponent from './form-component';
import { DatePickerPopover, CustomSelect } from './custom-form-items';
import { Button, buttonVariants } from '@/components/ui/button';
import { Check, CircleHelp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import TableComponent from './table-component';
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
import { cn } from '@/utils/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_ENDPOINTS } from '../constant/contant';
import useCampaignState from '../store/campaign-state';
import { useNavigation } from '../../(hub)/cms/_hooks/useNavigation';
import { useStateVariables } from '@/components/provider/state-provider';
import { useState } from 'react';
import { isEmpty } from '../../(hub)/cms/_utils/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface CampaignFormProps {
  initialData: any;
  isEditMode?: boolean;
}

export default function CampaignForm({
  initialData,
  isEditMode = false,
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

  const getCopyResourceEndpoint = (
    type: 'target' | 'image' | 'uiLanguage'
  ): string | null => {
    if (type === 'target') return API_ENDPOINTS.COPY_TARGET;
    if (type === 'image') return API_ENDPOINTS.COPY_IMAGE;
    if (type === 'uiLanguage') return API_ENDPOINTS.COPY_UI_LANG;
    return null;
  };

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
  return (
    <div className="w-full mb-6">
      <h2 className="text-size-17px font-semibold">
        {isEditMode ? 'Edit' : 'Create'} Certification
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="certification-form"
          className="space-y-8 mx-auto w-full max-w-[52.375rem] pt-16"
        >
          <span className="font-semibold">Basic Info</span>
          <div className="grid grid-rows-3 min-[880px]:grid-rows-4 gap-8">
            <Container>
              <FormField
                control={form.control}
                name="certificationName"
                render={({ field }) => (
                  <FormItem className="max-w-[20rem]">
                    <FormLabel>Certification Name</FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 shadow-none h-full max-h-10 p-3 text-size-14px"
                        {...field}
                        onKeyDown={handlePreventSpace}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <div className="flex relative w-fit">
                        <div className="max-w-[20rem] flex items-center">
                          <p className="text-size-12px text-zinc-500 underline h-10 px-3 leading-[2.5rem] border border-r-0 border-zinc-200 bg-zinc-50 rounded-l-md">
                            https://www.samsungplus.net/
                          </p>
                          <Input
                            className="rounded-s-none border-zinc-200 shadow-none h-full max-h-10 p-3 text-size-14px flex-grow"
                            {...field}
                            readOnly={isEditMode ? true : false}
                            value={isEditMode ? initialData?.slug : field.value} // TODO: 수정 필
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
                        <Button
                          variant={'secondary'}
                          className="absolute left-[20rem] border-zinc-200 shadow-none ml-5 text-size-14px h-10 font-normal text-zinc-500"
                          type="button"
                          disabled={isEmpty(form.getValues('slug'))}
                          onClick={handleCheckSlug}
                        >
                          Check
                          {!form.getFieldState('slug').isDirty &&
                            form.getValues('isSlugChecked') && <Check />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Container>
            <Container>
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full max-w-[20rem]">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePickerPopover field={field} />
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
                      <DatePickerPopover field={field} />
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
                name="uiLanguageSourceCampaignId"
                type="tooltip"
                description="The UI Language data used in the selected certification will be copied."
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
                <Input
                  {...field}
                  disabled={selectedNumberOfStages === undefined}
                  placeholder="Expert"
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
          <Button variant="action" form="certification-form">
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
