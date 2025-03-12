'use client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useLanguageData } from '../_provider/language-data-provider';
import { handleDownload } from '../../_utils/utils';
import { useStateVariables } from '@/components/provider/state-provider';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import { LoadingFullScreen } from '@/components/loader';
import useSWR from 'swr';
import { useEffect } from 'react';

export const columns: ColumnDef<LanguageProps>[] = [
  {
    accessorKey: 'name',
    header: 'Language',
  },
  {
    accessorKey: 'code',
    header: 'UI Code',
  },
  {
    accessorKey: 'excelUrl',
    header: 'File Name',
    cell: ({ getValue }) => {
      const path = getValue() as string;
      const fileName = path?.split('/').pop();
      //
      if (!fileName) return null;

      const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${path}`;
      return (
        <div className="space-x-10">
          <span>{fileName}</span>
          <Button
            variant="download"
            className="size-8"
            onClick={() => handleDownload(fileName, url)}
          >
            <Download />
          </Button>
        </div>
      );
    },
  },
];

export function DataTable() {
  const { campaign } = useStateVariables();
  const { data: languageData, isLoading: loading } = useSWR(
    `/api/cms/language?${searchParamsToQuery({ campaignName: campaign?.name })}`,
    swrFetcher
  );

  const { state, dispatch } = useLanguageData();
  const { result: data } = languageData || { result: [] };

  useEffect(() => {
    if (data.length > 0) {
      dispatch({ type: 'SET_LANGUAGE_LIST', payload: data });
    }
  }, [data]);

  const table = useReactTable({
    data: state.languages || data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {loading && <LoadingFullScreen />}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="h-16"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
