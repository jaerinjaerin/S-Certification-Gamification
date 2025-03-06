'use client';
import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import { Language, UploadedFile } from '@prisma/client';
import useSWR from 'swr';
import { columns } from './columns';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { cn } from '@/utils/utils';
import Link from 'next/link';
import { Download } from 'lucide-react';

interface UiLanguageDataTableProps {
  data: DataType[] | undefined;
  columns: ColumnDef<DataType>[];
}

export function UiLanguageDataTable() {
  const { campaign } = useStateVariables();
  const { data, isLoading: loading } = useSWR(
    `/api/cms/ui_language?${searchParamsToQuery({ campaignId: campaign?.id })}`,
    swrFetcher
  );

  if (loading) {
    return <LoaderWithBackground />;
  }

  if (!data.result.groupedLanguages) {
    return null;
  }

  return (
    // <DataTable data={data.result.groupedLanguages} columns={columns} />
    <div>
      <div className="grid grid-cols-5">
        <Colum>Language</Colum>
        <Colum>UI Code</Colum>
        <Colum>File Name</Colum>
      </div>

      {data.result.groupedLanguages.map(
        (
          groupedData: { file: UploadedFile; language: Language },
          index: number
        ) => {
          const filePath = groupedData.file.path;
          const filePathArr = filePath.split('/');
          const fileName = filePathArr[filePathArr.length - 1];

          return (
            <div
              key={index}
              className="grid grid-cols-5 border-t border-t-zinc-200"
            >
              <Colum className="py-6">{groupedData.language.name}</Colum>
              <Colum className="py-6">{groupedData.language.code}</Colum>
              <Colum className="py-6 gap-2.5">
                <span className="min-w-[7.5rem]">{fileName}</span>
                <Link
                  href={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${groupedData.file.path}`}
                  className="size-8 shadow-none  rounded-md bg-zinc-100 flex items-center justify-center hover:bg-zinc-200"
                >
                  <Download className="size-4" />
                </Link>
              </Colum>
            </div>
          );
        }
      )}
    </div>
  );
}

const Colum = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('p-4 flex items-center', className)}>{children}</div>
  );
};

const DataTable = ({ data = [], columns }: UiLanguageDataTableProps) => {
  console.log(data);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="p-4 text-zinc-500">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          );
        })}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id} className="px-4 py-6">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No registered UI language. Please select the Upload button to add
              one.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
