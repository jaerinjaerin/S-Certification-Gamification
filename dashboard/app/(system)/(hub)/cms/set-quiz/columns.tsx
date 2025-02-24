'use client';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';

export type sUser = {
  id: string;
  status: 'completed' | 'In Progress';
  subsidiary: string;
  domain: string;
  url: string;
  quizSet: string;
  activityId: string;
  uiLanguage: string;
};

export const sUserColumns: ColumnDef<sUser>[] = [
  {
    accessorKey: 'active',
    header: 'Active',
  },
  {
    accessorKey: 'Status',
    header: 'Status',
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'domainCode',
    header: 'Domain Code',
  },
  {
    accessorKey: 'url',
    header: 'URL',
  },
  {
    accessorKey: 'quizSet',
    header: 'Quiz Set',
  },
  {
    accessorKey: 'activityId',
    header: 'Activity ID',
  },
  {
    accessorKey: 'uiLanguage',
    header: 'UI Language',
  },
  {
    accessorKey: 'delete',
    header: 'Delete',
    cell: ({ row }) => {
      return (
        <div className="flex justify-center w-full">
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={() => {
              console.log('🥕 // TODO: 삭제기능 구현', row);
            }}
          >
            <Trash2 color="#EF4444" />
          </Button>
        </div>
      );
    },
  },
];
