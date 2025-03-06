import { TooltipComponent } from '@/app/(system)/campaign/_components/tooltip-component';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { CustomAlertDialog } from '../../../../_components/custom-alert-dialog';
import { GroupedQuizSet } from '../../../_type/type';
import { QuizSetLink, StatusBadge } from '../../data-table-widgets';
import { useNavigation } from '../../../../_hooks/useNavigation';

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
    cell: ({ row }) => {
      const { quizSetFile, activityBadges, uiLanguage } = row.original;
      const isReady =
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
    cell: ({ row }) => (
      <div className="uppercase">
        {row.original.quizSet.domain.subsidiary?.name ?? '-'}
      </div>
    ),
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
    accessorFn: (row) => row.quizSet.domain.name,
    cell: ({ row }) => <div>{row.original.quizSet.domain.name ?? '-'}</div>,
  },
  {
    accessorKey: 'domainCode',
    header: 'Domain Code',
    cell: ({ row }) => <div>{row.original.quizSet.domain.code ?? '-'}</div>,
  },
  {
    accessorKey: 'Job',
    header: 'Job',
    cell: ({ row }) => <div>{row.original.quizSet.jobCodes[0] ?? '-'}</div>,
  },
  {
    accessorKey: 'Quiz Language',
    header: 'Quiz Language',
    cell: ({ row }) => {
      if (row.original.quizSet.language) {
        return <div>{row.original.quizSet.language.name}</div>;
      }
      return <div>-</div>;
    },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      if (row.original.uiLanguage) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${row.original.quizSet.campaign.slug}/${row.original.quizSet.domain.code}_${row.original.quizSet.language?.code}`;
        return (
          <a href={url} target="_blank">
            {url}
          </a>
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
      if (!quizSetFile) {
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
          <>
            {row.original.activityBadges.map((badge, index) => (
              <div key={index}>
                {badge.badgeType}-{badge.activityId}
              </div>
            ))}
          </>
        );
      }
      return <div>-</div>;
    },
  },
  {
    accessorKey: 'uiLanguage',
    header: 'UI Language',

    cell: ({ row }) => {
      if (row.original.uiLanguage?.code) {
        return <div>{row.original.uiLanguage.code}</div>;
      }
      return <UILinkButton />;
    },
  },
  {
    accessorKey: 'delete',
    header: 'Delete',
    cell: ({ row }) => {
      const HQ = row.original.quizSet.domain.code === 'OrgCode-7';
      if (HQ) {
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
                  await handleQuizSetDelete(
                    row.original.quizSet.id,
                    row.original.quizSet.campaignId
                  ),
              },
            ]}
          />
        </div>
      );
    },
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
  } catch (error: any) {
    toast.error('Error deleting quiz set:', error);
    console.error('Error deleting quiz set:', error);
  }
};

const UILinkButton = () => {
  const { routeToPage } = useNavigation();
  return (
    <Button
      variant={'secondary'}
      className="justify-between h-auto text-left rounded-lg px-[10px] py-1 gap-8 border-zinc-200 shadow-none bg-red-300"
      onClick={() => routeToPage('/cms/ui-language')}
    >
      <div className="text-size-12px leading-tight font-semibold">Add</div>
    </Button>
  );
};
