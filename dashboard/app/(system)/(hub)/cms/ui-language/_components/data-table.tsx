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
      const fileName = (getValue() as string)?.split('/').pop();
      //
      if (!fileName) return null;
      return (
        <div className="space-x-10">
          <span>{fileName}</span>
          <Button variant="download" className="size-8">
            <Download />
          </Button>
        </div>
      );
    },
  },
];

export function DataTable({ data }: { data: LanguageProps[] }) {
  const { state, dispatch } = useLanguageData();

  useEffect(() => {
    if (data) {
      dispatch({ type: 'SET_LANGUAGE_LIST', payload: data });
    }
  }, []);

  const table = useReactTable({
    data: state.languages || data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table className="rounded-md">
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
    </div>
  );
}
