/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { CircleHelp, Pen, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formSchema, FormValues } from '../formSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// UI Components
import { Form } from '@/components/ui/form';
import { SelectContent, SelectItem } from '@/components/ui/select';

// Icons

// Local Components
import { DownloadFileListPopoverButton } from '../../(hub)/cms/_components/custom-popover';
import { CustomAlertDialog } from '../../(hub)/cms/_components/custom-alert-dialog';
import FormComponent from './create-certification/form-component';
import {
  CustomInput,
  CustomPopover,
  CustomSelect,
} from './create-certification/custom-form-items';
import Container from './create-certification/container';
import TableComponent from './create-certification/table-component';

// Utils and Helpers
import { useStateVariables } from '@/components/provider/state-provider';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

type CertificationFormState = {
  isFormOpen: boolean;
  type: 'create' | 'edit';
};

// type CampaignList = {
//   success: boolean;
//   result: { campaigns: Campaign[] };
// };

export default function CertificationClientComponent() {
  const { role, campaigns } = useStateVariables(); //role이 null이면 admin

  if (campaigns?.length === 0) {
    return (
      <div className="text-size-24px font-bold h-full flex items-center justify-center whitespace-pre-line text-center">
        {
          'You have no ongoing campaigns.\n로그인 했지만 인증제에 참여하지 않는 도메인 권한자에게 보여지는 메시지 필요.'
        }
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ width: 'calc(100vw - 48px)' }}
        className="flex justify-between items-center"
      >
        <h2 className="text-size-17px font-semibold">Certification List</h2>
        {!role && (
          <div className="flex gap-3">
            <DownloadFileListPopoverButton type="template" />
            <Button variant="action">Create Certification</Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-[1.125rem] gap-y-6 mt-8">
        {campaigns &&
          campaigns.map((campaign) => (
            <CertificationListItem key={campaign.id} campaign={campaign} />
          ))}
      </div>
    </div>
  );
}

function CertificationListItem({ campaign }: { campaign: Campaign }) {
  const { setCampaign } = useStateVariables();
  const router = useRouter();

  return (
    <div
      className="flex gap-2 items-center border border-zinc-200 rounded-lg justify-between p-6 shadow-sm"
      onClick={() => {
        setCampaign(campaign);
        router.push(`/dashboard/overview`);
      }}
    >
      <div className="px-3 grow min-w-0">
        <h3 className="text-size-24px font-semibold break-words">
          {campaign.name}
        </h3>
        <time className="text-zinc-500 text-size-14px">
          {`${dayjs(campaign.startedAt).format('YYYY.MM.DD')} ~ 
          ${dayjs(campaign.endedAt).format('YYYY.MM.DD')}`}
        </time>
      </div>
      <div className="flex gap-3">
        <CustomAlertDialog
          trigger={
            <Button
              variant="ghost"
              className="p-0 aspect-square size-[1.875rem] rounded-sm bg-zinc-50"
              onClick={() => {
                // setIsCreateCertification({
                //   isFormOpen: true,
                //   type: 'edit',
                // })
              }}
            >
              <Trash2
                style={{ width: '1.25rem', height: '1.25rem' }}
                className="text-red-500"
              />
            </Button>
          }
          description="Once deleted, the registered data cannot be restored. Are you sure you want to delete?"
          buttons={[
            { label: 'Cancel', variant: 'secondary', type: 'cancel' },
            { label: 'Delete', variant: 'delete', type: 'delete' },
          ]}
        />

        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            // setIsCreateCertification({
            //   isFormOpen: true,
            //   type: 'edit',
            // });
          }}
        >
          <Pen />
        </Button>
      </div>
    </div>
  );
}

function CertificationForm({
  isCreateCertification,
  setIsCreateCertification,
  campaigns,
}: {
  isCreateCertification: CertificationFormState;
  setIsCreateCertification: Dispatch<SetStateAction<CertificationFormState>>;
  campaigns: Campaign[];
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
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
    // const resetValue = (value: string) => {
    //   form.setValue(value as keyof FormValues, '');
    // };

    setIsCreateCertification({
      isFormOpen: false,
      type: 'create',
    });
  };

  return (
    <div className="w-full mb-6">
      <h2 className="text-size-17px font-semibold">
        {isCreateCertification.type === 'create'
          ? 'Create Certification'
          : 'Edit Certification'}
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
              {/* certification name */}
              <FormComponent
                className="max-w-[20rem]"
                form={form}
                label="Certification Name"
                name="certificationName"
                render={(field) => (
                  <CustomInput placeholder="Enter Name" {...field} />
                )}
              />
              {/* slug */}
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
                        className="rounded-s-none "
                        placeholder="enter-name"
                        {...field}
                      />

                      {/* <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          type="button"
                          onClick={() => resetValue(field.name)}
                        >
                          <RotateCw />
                        </Button> */}
                    </div>
                    <Button
                      variant={'secondary'}
                      className="border-zinc-200 shadow-none ml-5 text-size-14px h-10 font-normal text-zinc-500"
                    >
                      Check
                    </Button>
                  </div>
                )}
              />
            </Container>
            <Container>
              {/* start date */}
              <FormComponent
                className="flex flex-col w-full max-w-[20rem]"
                form={form}
                label="Start Date"
                name="startDate"
                render={(field) => <CustomPopover field={field} />}
              />
              {/* end date */}
              <FormComponent
                className="w-full flex flex-col"
                form={form}
                label="End Date"
                name="endDate"
                render={(field) => <CustomPopover field={field} />}
              />
            </Container>
            <Container>
              {/* copy media */}
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
              {/* copy target */}
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
                      {/* TODO: 이전 인증제 목록 */}
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
              {/* copy ui language */}
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
        <Button
          variant="secondary"
          onClick={() =>
            setIsCreateCertification({
              isFormOpen: false,
              type: 'create',
            })
          }
        >
          Cancel
        </Button>
        {!form.formState.isValid ? (
          <Button variant="action" form="certification-form">
            Save
          </Button>
        ) : (
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
            trigger={
              <Button variant="action" form="certification-form">
                Save
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
