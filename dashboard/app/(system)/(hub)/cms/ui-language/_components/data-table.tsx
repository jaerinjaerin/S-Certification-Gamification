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
import { useEffect, useState } from 'react';
import { handleDownload } from '../../_utils/utils';
import { useAbortController } from '@/components/hook/use-abort-controller';
import { useStateVariables } from '@/components/provider/state-provider';
import { fetchData } from '@/lib/fetch';
import { LoaderWithBackground } from '@/components/loader';

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
  const { abort, createController } = useAbortController();
  const { campaign } = useStateVariables();
  const { state, dispatch } = useLanguageData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setLoading(true);
      fetchData(
        { campaignName: campaign.name },
        'cms/language',
        (data) => {
          dispatch({ type: 'SET_LANGUAGE_LIST', payload: data.result });
          setLoading(false);
        },
        createController()
      );
    }

    return () => {
      abort();
      setLoading(false);
    };
  }, [campaign]);

  const table = useReactTable({
    data: state.languages || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {loading && <LoaderWithBackground />}
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
