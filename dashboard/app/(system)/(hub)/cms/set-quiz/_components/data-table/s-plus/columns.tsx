import { TooltipComponent } from '@/app/(system)/campaign/_components/tooltip-component';
import { Button } from '@/components/ui/button';
import { ActivityBadgeEx } from '@/types';
import { BadgeType } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { CustomAlertDialog } from '../../../../_components/custom-alert-dialog';
import { useNavigation } from '../../../../_hooks/useNavigation';
import { updateNoServiceChannel } from '../../../_lib/update-no-service-channel';
import { GroupedQuizSet } from '../../../_type/type';
import {
  ActivityIdBadge,
  QuizSetLink,
  StatusBadge,
} from '../../data-table-widgets';

export const columns: ColumnDef<GroupedQuizSet>[] = [
  // {
  //   accessorKey: 'Active',
  //   header: () => (
  //     <div className="flex gap-1 items-center">
  //       <span>Active</span>
  //       <TooltipComponent
  //         side="right"
  //         trigger={
  //           <CircleHelp className="size-3 text-secondary cursor-pointer" />
  //         }
  //         description={`When the toggle is turned off, the domain will be marked as not participating in this \n authentication method, and data cannot be uploaded.`}
  //       />
  //     </div>
  //   ),
  //   cell: () => <ActiveToggle />,
  // },
  {
    accessorKey: 'No',
    header: 'No',
    accessorFn: (_row, index) => index + 1,
    cell: ({ row }) => <div className="uppercase">{row.index + 1}</div>,
    sortingFn: 'auto',
  },
  {
    accessorKey: 'status',
    header: () => (
      <div className="flex gap-1 items-center">
        <span>Status</span>
        <TooltipComponent
          side="right"
          trigger={
            <CircleHelp className="size-3 text-secondary cursor-pointer" />
          }
          description={
            <p>
              <span className="font-bold">Not Ready:</span> The quiz cannot be
              started because not all data has been uploaded yet. <br />
              <span className="font-bold">Ready:</span> All data has been
              uploaded, and the quiz can now be started. In this case, the quiz
              URL will be generated.
            </p>
          }
        />
      </div>
    ),
    accessorFn: (row) => {
      const { quizSet, quizSetFile, activityBadges, uiLanguage } = row;
      const isReady =
        quizSet != null &&
        quizSetFile?.id &&
        activityBadges != null &&
        activityBadges.length > 0 &&
        uiLanguage?.code;
      return isReady;
    },
    cell: ({ row }) => {
      const { quizSet, quizSetFile, activityBadges, uiLanguage } = row.original;
      const isReady =
        quizSet != null &&
        quizSetFile?.id &&
        activityBadges != null &&
        activityBadges.length > 0 &&
        uiLanguage?.code;
      // const isReady = quizSetFile?.id && uiLanguage?.code;
      return <StatusBadge isReady={isReady} />;
    },
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
    accessorFn: (row) => row.domain.subsidiary?.name ?? '-',
    cell: ({ row }) => (
      <div className="uppercase">
        {row.original.domain.subsidiary?.name ?? '-'}
      </div>
    ),
    sortingFn: 'auto',
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
    accessorFn: (row) => row.domain.name ?? '-',
    cell: ({ row }) => <div>{row.original.domain.name ?? '-'}</div>,
    sortingFn: 'auto',
  },
  {
    accessorKey: 'domainCode',
    header: 'Domain Code',
    accessorFn: (row) => row.domain.code ?? '-',
    cell: ({ row }) => <div>{row.original.domain.code ?? '-'}</div>,
    sortingFn: 'auto',
  },
  {
    accessorKey: 'Job',
    header: 'Job',
    accessorFn: (row) =>
      row.quizSet?.jobCodes[0] ??
      row.activityBadges?.map((badge) => badge.jobCode[0]),
    cell: ({ row }) => (
      <div>
        {/* {row.original.quizSet?.jobCodes[0] ?? '-'} */}
        {row.original.quizSet?.jobCodes[0] ??
          row.original.activityBadges?.map((badge) => badge.jobCode)[0]}
      </div>
    ),
    sortingFn: 'auto',
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      if (row.original.uiLanguage && row.original.quizSet) {
        const url = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${row.original.campaign.slug}/${row.original.domain.code}_${row.original.uiLanguage.code}`;

        return (
          <div className="flex gap-[0.438rem]">
            <Button
              variant={'secondary'}
              className="size-[2.375rem]"
              onClick={() => {
                window.navigator.clipboard.writeText(url);
                alert('copy to clipboard:\n' + url);
              }}
              title={url}
            >
              <Copy />
            </Button>
            <Button
              variant={'secondary'}
              className="size-[2.375rem]"
              onClick={() => {
                window.open(url, '_blank');
              }}
              title={url}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>
        );
      }
      return <div>-</div>;
    },
    sortingFn: 'auto',
  },
  {
    accessorKey: 'quizSet',
    header: 'Quiz Set',
    cell: ({ row }) => {
      const { quizSet, quizSetFile } = row.original;
      if (!quizSetFile || !quizSet) {
        return;
      }
      return <QuizSetLink props={quizSet} />;
    },
    sortingFn: 'auto',
  },
  {
    accessorKey: 'activityId',
    header: 'Activity ID',
    cell: ({ row }) => {
      if (row.original.activityBadges) {
        return (
          <div className="flex flex-col gap-2.5">
            {row.original.activityBadges.map((badge, index) => {
              const stageNum = getStageNumFromActivityBadge(
                badge as ActivityBadgeEx,
                row
              );
              if (
                stageNum === 0 ||
                badge.activityId == null ||
                badge.activityId === ''
              ) {
                return <div key={`empty-${index}`}></div>;
              }
              return (
                <ActivityIdBadge
                  key={index}
                  id={badge.activityId}
                  stage={stageNum}
                />
              );
            })}
          </div>
        );
      }
      return <div>-</div>;
    },
    sortingFn: 'auto',
  },
  {
    accessorKey: 'Badge',
    header: 'Badge',
    cell: ({ row }) => {
      if (row.original.activityBadges) {
        return (
          <div className="flex flex-col gap-2.5">
            {row.original.activityBadges.map((badge, index) => {
              const stageNum = getStageNumFromActivityBadge(
                badge as ActivityBadgeEx,
                row
              );
              if (stageNum === 0) {
                return <></>;
              }
              return (
                <ActivityIdBadge
                  key={index}
                  stage={stageNum}
                  src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${badge.badgeImage?.imagePath}`}
                />
              );
            })}
          </div>
        );
      }
      return <div>-</div>;
    },
    sortingFn: 'auto',
  },
  {
    accessorKey: 'uiLanguage',
    header: 'UI Language',
    cell: ({ row }) => {
      if (row.original.uiLanguage?.name) {
        return <div>{row.original.uiLanguage.name}</div>;
      }
      return <UILinkButton />;
    },
    sortingFn: 'auto',
  },
  {
    accessorKey: 'delete',
    header: 'Delete',
    cell: ({ row }) => {
      const HQ = row.original.domain.code === 'OrgCode-7';
      if (HQ) {
        return;
      }

      const quizSet = row.original.quizSet;
      if (!quizSet) {
        return;
      }

      return (
        <div className="flex items-center justify-center text-center">
          <CustomAlertDialog
            trigger={
              <Button variant={'ghost'} size={'icon'}>
                <Trash2 className="text-red-500 !size-6" />
              </Button>
            }
            description={
              'Once deleted, the registered data cannot be restored. \n Are you sure you want to delete?'
            }
            buttons={[
              {
                label: 'Cancel',
                variant: 'secondary',
                type: 'cancel',
              },
              {
                label: 'Delete',
                variant: 'delete',
                type: 'delete',
                onClick: async () =>
                  await handleQuizSetDelete(quizSet.id, quizSet.campaignId),
              },
            ]}
          />
        </div>
      );
    },
    sortingFn: 'auto',
  },
];

const handleQuizSetDelete = async (quizSetId: string, campaignId: string) => {
  try {
    const response = await fetch(`/api/cms/quizset?quizSetId=${quizSetId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      toast.error(`Error deleting quiz set: ${response.statusText}`);
      return;
    }

    mutate(
      (key) =>
        typeof key === 'string' &&
        key.includes(`quizset?campaignId=${campaignId}`)
    );
    toast.success('Quiz set deleted successfully');
    updateNoServiceChannel(campaignId);
  } catch (error: any) {
    toast.error('Error deleting quiz set:', error);
    console.error('Error deleting quiz set:', error);
  }
};

const getStageNumFromActivityBadge = (badge: ActivityBadgeEx, row: any) => {
  let stageNum = 0;
  if (
    badge.badgeType === BadgeType.FIRST &&
    badge.jobCode.toLowerCase() === 'ff'
  ) {
    const firstBadgeStage =
      row.original?.campaign?.settings.ffFirstBadgeStageIndex;
    if (firstBadgeStage) {
      stageNum = firstBadgeStage + 1;
    }
  } else if (
    badge.badgeType === BadgeType.FIRST &&
    badge.jobCode.toLowerCase() === 'fsm'
  ) {
    const badgeStage =
      row?.original?.campaign?.settings?.fsmFirstBadgeStageIndex;
    if (badgeStage) {
      stageNum = badgeStage + 1;
    }
  } else if (
    badge.badgeType === BadgeType.SECOND &&
    badge.jobCode.toLowerCase() === 'ff'
  ) {
    const badgeStage =
      row?.original?.campaign?.settings?.ffSecondBadgeStageIndex;
    if (badgeStage) {
      stageNum = badgeStage + 1;
    }
  } else if (
    badge.badgeType === BadgeType.SECOND &&
    badge.jobCode.toLowerCase() === 'fsm'
  ) {
    const badgeStage =
      row?.original?.campaign?.settings?.fsmSecondBadgeStageIndex;
    if (badgeStage) {
      stageNum = badgeStage + 1;
    }
  }

  return stageNum;
};

const UILinkButton = () => {
  const { routeToPage } = useNavigation();
  return (
    <Button
      variant={'secondary'}
      className="justify-between h-auto text-left rounded-lg px-[10px] py-1 gap-8 border-zinc-200 shadow-none bg-zinc-200"
      onClick={() => routeToPage('/cms/ui-language')}
    >
      <div className="text-size-12px leading-tight font-semibold">Add</div>
    </Button>
  );
};
