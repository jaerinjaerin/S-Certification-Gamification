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
import { useTargetData } from '../_provider/target-data-provider';
import { useEffect } from 'react';

export const columns: ColumnDef<TargetProps>[] = [
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'total',
    header: 'Total',
  },
  {
    accessorKey: 'ff',
    header: 'FF Target',
  },
  {
    accessorKey: 'ffSes',
    header: 'FF(SES) Target',
  },
  {
    accessorKey: 'fsm',
    header: 'FSM Target',
  },
  {
    accessorKey: 'fsmSes',
    header: 'FSM(SES) Target',
  },
];

export function DataTable({ data }: { data: TargetProps[] }) {
  const { state, dispatch } = useTargetData();

  useEffect(() => {
    if (data) {
      dispatch({ type: 'SET_TARGET_LIST', payload: data });
    }
  }, []);

  const table = useReactTable({
    data: state.targets || data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
  );
}
