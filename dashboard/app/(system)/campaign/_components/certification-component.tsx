'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Pen, RotateCw } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { formSchema, FormValues } from '../formSchema';

import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DownloadFileListPopoverButton } from '../../(hub)/cms/_components/custom-popover';

type CertificationFormState = {
  isFormOpen: boolean;
  type: 'create' | 'edit';
};

export default function CertificationClientComponent() {
  const [isCreateCertification, setIsCreateCertification] =
    useState<CertificationFormState>({
      isFormOpen: false,
      type: 'create',
    });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign`
        );

        if (!response.ok) {
          console.error('Failed to fetch campaigns');
          return;
        }

        const data = await response.json();
        setCampaigns(data.campaigns);
        console.log('Campaigns:', data);
      } catch (error) {
        console.error('Error get campaigns: ', error);
        alert('Failed to fetch campaigns');
      }
    };

    fetchCampaigns();
  }, []);

  if (
    isCreateCertification.isFormOpen &&
    isCreateCertification.type === 'create'
  ) {
    return (
      <CertificationForm
        isCreateCertification={isCreateCertification}
        setIsCreateCertification={setIsCreateCertification}
        campaigns={campaigns}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between">
        <h2>Certification List</h2>
        <div>
          <DownloadFileListPopoverButton type="template" />

          <Button
            variant="action"
            onClick={() =>
              setIsCreateCertification({
                isFormOpen: true,
                type: 'create',
              })
            }
          >
            Create Certification
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {campaigns &&
          campaigns.map((campaign) => (
            <CertificationListItem
              key={campaign.id}
              campaign={campaign}
              setIsCreateCertification={setIsCreateCertification}
            />
          ))}
      </div>
    </div>
  );
}

function CertificationListItem({
  setIsCreateCertification,
  campaign,
}: {
  setIsCreateCertification: Dispatch<SetStateAction<CertificationFormState>>;
  campaign: Campaign;
}) {
  return (
    <div className="flex items-center border border-zinc-200 rounded-md">
      <div>
        <h3>{campaign.name}</h3>
        <time>
          {campaign.startedAt} ~ {campaign.endedAt}
        </time>
      </div>
      <Button
        variant="ghost"
        onClick={() =>
          setIsCreateCertification({
            isFormOpen: true,
            type: 'edit',
          })
        }
      >
        <Pen />
      </Button>
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
  };

  console.log('🥕 errors', form.formState.errors);
  const resetValue = (value: string) => {
    form.setValue(value as keyof FormValues, '');
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold">
        {isCreateCertification.type === 'create'
          ? 'Create Certification'
          : 'Edit Certification'}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="certification-form"
          className="space-y-8 px-[205px]"
        >
          <FormField
            control={form.control}
            name="certificationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="flex">
                    <span>https://www.samsungplus.net/</span>
                    <Input placeholder="Enter Slug" {...field} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      type="button"
                      onClick={() => resetValue(field.name)}
                    >
                      <RotateCw />
                    </Button>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 "
                      align="start"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
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
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 " align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
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
            name="imageSourceCampaignId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media to Copy (Optional)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: 이전 인증제 목록 */}
                      <SelectItem value="none">None</SelectItem>
                      {campaigns &&
                        campaigns.map((campaign) => (
                          <SelectItem value={campaign.id} key={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      {/* <SelectItem value="none">None</SelectItem>
                      <SelectItem value="est">Galaxy AI Expert</SelectItem>
                      <SelectItem value="cst">Galaxy A10 Expert</SelectItem> */}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetSourceCampaignId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target to Copy (Optional)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: 이전 인증제 목록 */}
                      <SelectItem value="none">None</SelectItem>
                      {campaigns &&
                        campaigns.map((campaign) => (
                          <SelectItem value={campaign.id} key={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      {/* <SelectItem value="none">None</SelectItem>
                      <SelectItem value="est">Galaxy AI Expert</SelectItem>
                      <SelectItem value="cst">Galaxy A10 Expert</SelectItem> */}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div>Stage Setting</div>
          <FormField
            control={form.control}
            name="numberOfStages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Stages</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div>Badge Setting</div>
          <FormField
            control={form.control}
            name="firstBadgeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Badge Name</FormLabel>
                <FormControl>
                  <Input placeholder="Expert" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondBadgeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Second Badge Name</FormLabel>
                <FormControl>
                  <Input placeholder="Advanced" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Group</TableHead>
                <TableHead>First Badge Stage</TableHead>
                <TableHead>Second Badge Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>FF</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="ffFirstBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="ffSecondBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>FSM</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="fsmFirstBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="fsmSecondBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </form>
      </Form>
      <div className="flex justify-center">
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

        <Button variant="action" type="submit" form="certification-form">
          Save
        </Button>
      </div>
    </div>
  );
}
