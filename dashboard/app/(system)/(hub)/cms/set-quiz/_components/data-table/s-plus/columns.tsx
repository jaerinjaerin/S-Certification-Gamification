import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp, ExternalLink, Trash2 } from 'lucide-react';
import { GroupedQuizSet } from '../../../_type/type';

export const columns: ColumnDef<GroupedQuizSet>[] = [
  {
    accessorKey: 'Active',
    header: 'Active',
    cell: () => <div>Active</div>,
  },
  {
    accessorKey: 'status',
    header: () => (
      <div>
        <span>Status</span>
        <CircleHelp />
      </div>
    ),
    cell: ({ row }) => <div> {row.getValue('status') ?? '-'}</div>,
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
    cell: ({ row }) => <div>{row.original.quizSet.language?.code ?? '-'}</div>,
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: () => <div>URL</div>,
  },
  {
    accessorKey: 'quizSet',
    header: 'Quiz Set',
    cell: () => (
      <Button variant="outline" size="sm">
        <ExternalLink />
      </Button>
    ),
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
      <div>{row.original.webLanguage?.language?.code ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'delete',
    header: 'Delete',
    cell: () => (
      <Button variant="outline" size="sm">
        <Trash2 />
      </Button>
    ),
  },
];
