'use client';
import { LoadingFullScreen } from '@/components/loader';
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
import { cn } from '@/utils/utils';
import { Language, UploadedFile } from '@prisma/client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useLanguageData } from '../_provider/language-data-provider';

interface UiLanguageDataTableProps {
  data: DataType[] | undefined;
  columns: ColumnDef<DataType>[];
}

export function UiLanguageDataTable() {
  const { campaign } = useStateVariables();
  const fallbackData = useMemo(
    () => ({ result: { groupedLanguages: [] } }),
    []
  );
  const swrKey = useMemo(
    () =>
      `/api/cms/ui_language?${searchParamsToQuery({ campaignId: campaign?.id })}`,
    [campaign]
  );
  const { dispatch } = useLanguageData();
  const { data: languageData, isLoading: loading } = useSWR(
    swrKey,
    swrFetcher,
    {
      fallbackData,
    }
  );

  const { result: data } = useMemo(() => languageData, [languageData]);

  useEffect(() => {
    if (data?.groupedLanguages) {
      dispatch({
        type: 'SET_LANGUAGE_LIST',
        payload: data.groupedLanguages,
      });
    }
  }, [data]);

  if (loading) {
    return <LoadingFullScreen />;
  }

  if (!data.groupedLanguages) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-start space-x-3 py-4">
        <div className=" text-sm text-zinc-950">
          Total :
          <strong className="font-bold">
            {` ${data.groupedLanguages.length}`}
          </strong>
        </div>
      </div>
      <div className="border rounded-md">
        <div className="grid grid-cols-5">
          <Colum className="text-nowrap text-zinc-500 font-medium">
            Language
          </Colum>
          <Colum className="text-nowrap text-zinc-500 font-medium">
            UI Code
          </Colum>
          <Colum className="text-nowrap text-zinc-500 font-medium">
            File Name
          </Colum>
        </div>

        {data.groupedLanguages.length ? (
          data.groupedLanguages.map(
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
                  <Colum className="py-6 break-all">
                    {groupedData.language.name}
                  </Colum>
                  <Colum className="py-6">{groupedData.language.code}</Colum>
                  <Colum className="py-6 gap-2.5">
                    <span className="min-w-[7.5rem]">{fileName}</span>
                    <Link
                      href={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${groupedData.file.path}`}
                      className="size-8 shadow-none shrink-0  rounded-md bg-zinc-100 flex items-center justify-center hover:bg-zinc-200"
                    >
                      <Download className="size-4" />
                    </Link>
                  </Colum>
                </div>
              );
            }
          )
        ) : (
          <div className="grid grid-cols-5 border-t border-t-zinc-200">
            <Colum className="py-6 col-span-5 justify-center">
              No registered UI language. Please select the Upload button to add
              one.
            </Colum>
          </div>
        )}
      </div>
    </div>
    // <DataTable data={data.result.groupedLanguages} columns={columns} />
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
