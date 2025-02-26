'use client';
// External libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleHelp } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { SelectContent, SelectItem } from '@/components/ui/select';

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
import { formSchema, FormValues } from './_type/formSchema';

export default function CreateCampaignPage() {
  const { campaigns } = useStateVariables();
  const { routeToPage } = useNavigation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificationName: '',
      slug: '',
      startDate: undefined,
      endDate: undefined,
      copyMedia: undefined,
      copyTarget: undefined,
      copyUiLanguage: undefined,
      numberOfStages: undefined,
      firstBadgeName: '',
      ffFirstBadgeStage: undefined,
      fsmFirstBadgeStage: undefined,
      secondBadgeName: '',
      ffSecondBadgeStage: undefined,
      fsmSecondBadgeStage: undefined,
      targetSourceCampaignId: undefined,
      imageSourceCampaignId: undefined,
    },
  });

  const isFormValid = form.formState.isValid;

  const onSubmit = async (data: FormValues) => {
    console.log('Form Data:', data);

    console.warn('loading start');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.certificationName,
          slug: data.slug,
          // description: 'description',
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
      }
    );

    const campaignData = await response.json();
    if (!response.ok) {
      console.error('Failed to create campaign', campaignData);
      return;
    }

    console.warn('complete campaign');

    const campaign = campaignData.campaign;
    const campaignSettings = campaignData.campaignSettings;

    console.warn('campaign:', campaign);
    console.warn('campaignSettings:', campaignSettings);

    if (data.targetSourceCampaignId) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/resource/target/copy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceCampaignId: data.targetSourceCampaignId,
            destinationCampaignId: campaign.id,
          }),
        }
      );

      if (response.ok) {
        console.warn('complete copy target');
      }
    }

    if (data.imageSourceCampaignId) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/resource/image/copy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceCampaignId: data.imageSourceCampaignId,
            destinationCampaignId: campaign.id,
          }),
        }
      );

      if (response.ok) {
        console.warn('complete copy images');
      }
    }

    console.warn('loading end');
    alert('Certification created successfully');

    console.log('🥕 errors', form.formState.errors);
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
                    <CustomInput placeholder="Enter Name" {...field} />
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
                          placeholder="enter-name"
                          {...field}
                        />
                      </div>
                      <Button
                        variant={'secondary'}
                        className="border-zinc-200 shadow-none ml-5 text-size-14px h-10 font-normal text-zinc-500"
                        type="button"
                        onClick={() => {
                          console.log('🥕 slug', form.getValues('slug'));
                          // TODO: slug 중복체크 로직 추가
                        }}
                      >
                        Check
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
                        {/* TODO: 이전 인증제 목록 */}
                        <SelectItem value="none">None</SelectItem>
                        {campaigns &&
                          campaigns.map((campaign) => {
                            // console.log(campaign);
                            return (
                              <SelectItem value={campaign.id} key={campaign.id}>
                                {campaign.name}
                              </SelectItem>
                            );
                          })}
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
                        {/* TODO: 이전 인증제 목록 */}
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="est">Galaxy AI Expert</SelectItem>
                        <SelectItem value="cst">Galaxy A10 Expert</SelectItem>
                      </SelectContent>
                    </CustomSelect>
                  )}
                />
              </div>
            </div>
            <Separator />
            <p className="font-semibold">Stage Setting</p>
            <FormComponent
              className="max-w-[20rem]"
              form={form}
              label="Number of Stages"
              name="numberOfStages"
              render={(field) => (
                <CustomSelect field={field} selectDefaultValue="Select">
                  <SelectContent>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <SelectItem value={`${index}`} key={index}>
                        {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </CustomSelect>
              )}
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
                  <CustomInput placeholder="Expert" {...field} />
                )}
              />
              <FormComponent
                className="max-w-[20rem]"
                form={form}
                label="Second Badge Name"
                name="secondBadgeName"
                render={(field) => (
                  <CustomInput placeholder="Advanced" {...field} />
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

          {isFormValid ? (
            <CustomAlertDialog
              description="Once you create a certification, you cannot change the Slug, Media to Copy, Target to Copy, or UI Language to Copy. Are you sure you want to save?"
              buttons={[
                { label: 'Cancel', type: 'cancel', variant: 'secondary' },
                {
                  label: 'Save',
                  type: 'save',
                  variant: 'action',
                  onClick: form.handleSubmit(onSubmit),
                },
              ]}
              trigger={<Button variant="action">Save</Button>}
            />
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
