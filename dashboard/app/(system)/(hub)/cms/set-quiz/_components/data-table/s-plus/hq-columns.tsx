import { Button } from '@/components/ui/button';
import { ActivityBadgeEx } from '@/types';
import { BadgeType } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { useNavigation } from '../../../../_hooks/useNavigation';
import { updateNoServiceChannel } from '../../../_lib/update-no-service-channel';
import { GroupedQuizSet } from '../../../_type/type';
import {
  ActivityIdBadge,
  QuizSetLink,
  StatusBadge,
} from '../../data-table-widgets';
import { format } from 'date-fns';

export const hqColumns: ColumnDef<GroupedQuizSet>[] = [
  {
    accessorKey: 'status',
    header: () => (
      <div className="flex gap-1 items-center">
        <span>Status</span>
      </div>
    ),
    cell: ({ row }) => {
      const { quizSet, quizSetFile, activityBadges, uiLanguage } = row.original;
      const isReady =
        quizSet != null &&
        quizSetFile?.id &&
        activityBadges != null &&
        activityBadges.length > 0 &&
        uiLanguage?.code;

      return <StatusBadge isReady={isReady} />;
    },
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
    cell: ({ row }) => {
      const jobCode =
        row.original.quizSet?.jobCodes[0] ??
        row.original.activityBadges?.map((badge) => badge.jobCode)[0];
      return (
        <div className="uppercase flex items-center gap-1">
          <span>HQ</span>
          {jobCode === 'ff' && (
            <span className="bg-blue-600 inline-block rounded-2xl px-[11px] py-[5px]">
              <Flag className="size-4" color="white" />
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
    accessorFn: (row) => row.domain.name,
    cell: ({ row }) => <div>{row.original.domain.name ?? '-'}</div>,
  },
  {
    accessorKey: 'domainCode',
    header: 'Domain Code',
    cell: ({ row }) => <div>{row.original.domain.code ?? '-'}</div>,
  },
  {
    accessorKey: 'Job',
    header: 'Job',
    cell: ({ row }) => (
      <div>
        {row.original.quizSet?.jobCodes[0] ??
          row.original.activityBadges?.map((badge) => badge.jobCode)[0]}
      </div>
    ),
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
  },
  {
    accessorKey: 'activityId',
    header: 'Activity ID',
    cell: ({ row }) => {
      if (row.original.activityBadges) {
        return (
          <div className="flex flex-col gap-2.5">
            {/* <ActivityIdBadge id={10000} stage={3} /> */}
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
                return <></>;
              }
              return (
                <ActivityIdBadge
                  key={index}
                  id={badge.activityId}
                  stage={stageNum}
                />
                // <div key={index} className="flex items-center gap-2">
                //   <span className="font-bold">{stageNum}</span>
                //   {badge.activityId}
                // </div>
              );
            })}
          </div>
        );
      }
      return <div>-</div>;
    },
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
                <div key={index}>
                  {badge.badgeImage?.imagePath && (
                    <ActivityIdBadge
                      src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${badge.badgeImage?.imagePath}`}
                      stage={getStageNumFromActivityBadge(
                        badge as ActivityBadgeEx,
                        row
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      return <div>-</div>;
    },
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
  },
  {
    accessorKey: 'quizset-updatedby',
    header: 'Updated By',
    cell: ({ row }) => {
      const { quizSet } = row.original;
      if (!quizSet) {
        return;
      }
      return <div>{quizSet.updatedBy}</div>;
    },
    sortingFn: 'auto',
  },
  {
    accessorKey: 'quizset-updatedat',
    header: 'Updated At',
    cell: ({ row }) => {
      const { quizSet } = row.original;
      if (!quizSet) {
        return;
      }
      return (
        <div className="text-xs">
          {format(
            quizSet.updatedAt ?? quizSet.createdAt,
            'yyyy.MM.dd HH:mm:ss'
          )}
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
    const badgeStage = row.original.campaign.settings.ffFirstBadgeStageIndex;
    if (badgeStage != null) {
      stageNum = badgeStage + 1;
    }
  } else if (
    badge.badgeType === BadgeType.FIRST &&
    badge.jobCode.toLowerCase() === 'fsm'
  ) {
    const badgeStage = row.original.campaign.settings.fsmFirstBadgeStageIndex;
    if (badgeStage != null) {
      stageNum = badgeStage + 1;
    }
  } else if (
    badge.badgeType === BadgeType.SECOND &&
    badge.jobCode.toLowerCase() === 'ff'
  ) {
    const badgeStage = row.original.campaign.settings.ffSecondBadgeStageIndex;
    if (badgeStage != null) {
      stageNum = badgeStage + 1;
    }
  } else if (
    badge.badgeType === BadgeType.SECOND &&
    badge.jobCode.toLowerCase() === 'fsm'
  ) {
    const badgeStage = row.original.campaign.settings.fsmSecondBadgeStageIndex;
    if (badgeStage != null) {
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
