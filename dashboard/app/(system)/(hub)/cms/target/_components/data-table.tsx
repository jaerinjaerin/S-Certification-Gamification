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
import { useEffect, useMemo } from 'react';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import { useStateVariables } from '@/components/provider/state-provider';
import { LoadingFullScreen } from '@/components/loader';
import useSWR from 'swr';

export const columns: ColumnDef<TargetProps>[] = [
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => {
      return <span>{(getValue() as number).toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'fsmSes',
    header: 'FSM(SES)',
    cell: ({ getValue }) => {
      return <span>{(getValue() as number).toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'fsm',
    header: 'FSM',
    cell: ({ getValue }) => {
      return <span>{(getValue() as number).toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'ffSes',
    header: 'FF(SES)',
    cell: ({ getValue }) => {
      return <span>{(getValue() as number).toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'ff',
    header: 'FF',
    cell: ({ getValue }) => {
      return <span>{(getValue() as number).toLocaleString()}</span>;
    },
  },
];

export function DataTable() {
  const { campaign } = useStateVariables();
  const { state, dispatch } = useTargetData();
  const fallbackData = useMemo(() => ({ result: [] }), []);
  const swrKey = useMemo(
    () =>
      `/api/cms/target?${searchParamsToQuery({ campaignId: campaign?.id })}`,
    [campaign]
  );
  const { data: targetData, isLoading: loading } = useSWR(swrKey, swrFetcher, {
    fallbackData,
  });
  const { result: data } = useMemo(() => targetData, [targetData]);

  useEffect(() => {
    if (data.length > 0) {
      dispatch({ type: 'SET_TARGET_LIST', payload: data });
    }
  }, [data]);

  const table = useReactTable({
    data: state.targets || data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {loading && <LoadingFullScreen />}
      <div className="flex items-center justify-start space-x-3 py-4">
        <div className=" text-sm text-zinc-950">
          Total :
          <strong className="font-bold">
            {` ${table.getRowModel().rows.length}`}
          </strong>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="p-4">
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No registered Target. Please select the Upload button to add
                  one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
