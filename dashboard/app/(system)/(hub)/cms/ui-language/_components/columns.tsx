'use client';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';

type Language = {
  language: string;
  uiCode: string;
  fileName: string;
};

export const columns: ColumnDef<Language>[] = [
  {
    accessorKey: 'name',
    header: 'Language',
  },
  {
    accessorKey: 'code',
    header: 'UI Code',
  },
  {
    accessorKey: 'fileName',
    header: 'File Name',
    cell: ({ row }) => {
      const fileName = row.getValue('fileName') as string;

      return (
        <div>
          {fileName}
          {fileName && (
            <Button variant="download" size="icon">
              <Download />
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
