'use client';

import { useState } from 'react';
import useSWR from 'swr';

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

import { DomainChannel } from '@/types/apiTypes';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { fetcher } from '../../../../lib/fetcher';
import { NoServiceChannelsResponse } from '../../../_type/type';
import { columns } from './columns';
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoServiceChannelDataTableProps {
  data: DomainChannel[] | undefined;
  columns: ColumnDef<DomainChannel>[];
  slug: string | undefined;
}

export default function NonSplusDataTable() {
  const { campaign } = useStateVariables();
  const QUIZSET_DATA_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cms/no_service_channel?campaignId=${campaign?.id}`;
  const { data, isLoading } = useSWR<NoServiceChannelsResponse>(
    QUIZSET_DATA_URL,
    fetcher
  );

  if (isLoading) {
    return <LoadingFullScreen />;
  }
  return (
    <DataTable
      data={data?.result.channels ?? []}
      columns={columns}
      slug={campaign?.slug}
    />
  );
}

function DataTable({
  data = [],
  columns,
  slug,
}: NoServiceChannelDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const url = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${slug}/login`;
  const length = table.getFilteredRowModel().rows.length;

  return (
    <div className="data-table">
      <div className="flex items-center space-x-2 pt-[1.438rem] pb-2 justify-between">
        <div className="flex-1 text-sm text-zinc-950">
          Total :<strong className="font-bold">{` ${length}`}</strong>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-size-12px font-semibold">URL</span>
          <div className="flex gap-[0.438rem]">
            <Button
              disabled={length === 0}
              variant={'secondary'}
              className="size-[2.375rem]"
              onClick={() => {
                window.navigator.clipboard.writeText(url);
                alert('copy to clipboard:\n' + url);
              }}
              title={url}
            >
              <Copy />
            </Button>
            <Button
              disabled={length === 0}
              variant={'secondary'}
              className="size-[2.375rem]"
              onClick={() => {
                window.open(url, '_blank');
              }}
              title={url}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="p-4 text-nowrap"
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {!(
                          header.id.toLowerCase() === 'channel' ||
                          header.id.toLowerCase() === 'channelsegment' ||
                          header.id.toLowerCase() === 'jobgroup'
                        ) ? (
                          <>
                            {(() => {
                              const sortDirection = header.column.getIsSorted();
                              return sortDirection
                                ? {
                                    asc: (
                                      <ChevronDown className="size-4 cursor-pointer hover:bg-zinc-200 rounded-sm" />
                                    ),
                                    desc: (
                                      <ChevronUp className="size-4 cursor-pointer hover:bg-zinc-200 rounded-sm" />
                                    ),
                                  }[sortDirection]
                                : null;
                            })()}
                            {header.column.getCanSort() &&
                            !header.column.getIsSorted() ? (
                              <ChevronsUpDown className="size-4 cursor-pointer hover:bg-zinc-200 rounded-sm" />
                            ) : null}
                          </>
                        ) : null}
                      </div>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-4 py-6" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No registered Non S+ Users. Please press the Upload button to
                  add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
