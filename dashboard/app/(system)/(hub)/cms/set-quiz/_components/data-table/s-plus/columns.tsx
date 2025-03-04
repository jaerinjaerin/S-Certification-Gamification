import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp, ExternalLink, Trash2 } from 'lucide-react';
import { GroupedQuizSet } from '../../../_type/type';
import { TooltipComponent } from '@/app/(system)/campaign/_components/tooltip-component';
import {
  ActiveToggle,
  QuizSetLink,
  StatusBadge,
} from '../../data-table-widgets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomAlertDialog } from '../../../../_components/custom-alert-dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { mutate } from 'swr';

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
      const { quizSetFile, activityBadge } = row.original;
      const isReady = quizSetFile?.id && activityBadge?.activityId;
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
      // console.log(
      //   '🥕 row.original.quizSet.language',
      //   row.original.quizSet.language
      // );
      return <div>{row.original.quizSet.language?.code ?? '-'}</div>;
    },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: () => <div>URL</div>,
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
    // cell: ({ row }) => <div>{row.getValue('activityId')}</div>,
    cell: ({ row }) => (
      <div>{row.original.activityBadge?.activityId ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'uiLanguage',
    header: 'UI Language',
    // cell: ({ row }) => <div>{row.getValue('uiLanguage')}</div>,
    cell: ({ row }) => (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select">Select</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">none</SelectItem>
        </SelectContent>
      </Select>
      // <div>{row.original.webLanguage?.language?.code ?? '-'}</div>
    ),
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
                onClick: () => {},
              },
              {
                label: 'Delete',
                variant: 'destructive',
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
  console.log('TODO: 퀴즈 세트 삭제', quizSetId, campaignId);
  // 완료되었을 때 toast
  // mutate(`quizset?campaignId=${campaignId}`);
  try {
    const response = await fetch(`/api/cms/quizset?quizSetId=${quizSetId}`, {
      method: 'DELETE',
    });
    console.log('🥕 response', response);
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
