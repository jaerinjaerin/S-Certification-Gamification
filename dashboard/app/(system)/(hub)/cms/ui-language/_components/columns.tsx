'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import Link from 'next/link';

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: 'name',
    header: 'Language',
    cell: ({ row }) => {
      return <span>{row.original.language?.name}</span>;
    },
  },
  {
    accessorKey: 'code',
    header: 'UI Code',
    cell: ({ row }) => {
      return <span>{row.original.language?.code}</span>;
    },
  },
  {
    accessorKey: 'fileName',
    header: 'File Name',
    cell: ({ row }) => {
      // const fileName = row.getValue('fileName') as string;
      const filePath = row.original.file.path;
      const filePathArr = filePath.split('/');
      const fileName = filePathArr[filePathArr.length - 1];

      return (
        <div className="flex items-center gap-2.5">
          <span>{fileName}</span>
          <Link
            href={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${filePath}`}
            className="size-8 shadow-none  rounded-md bg-zinc-100 flex items-center justify-center hover:bg-zinc-200"
          >
            <Download className="size-4" />
          </Link>
        </div>
        // <div>

        //   {fileName}
        //   {fileName && (
        //     <Button
        //       className="size-8 shadow-none"
        //       variant="download"
        //       size="icon"
        //     >
        //       <Download />
        //     </Button>
        //   )}
        // </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
