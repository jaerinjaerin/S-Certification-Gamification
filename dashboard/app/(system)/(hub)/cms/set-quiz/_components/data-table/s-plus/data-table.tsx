'use client';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronsUpDown, ChevronUp, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { isEmpty } from '../../../../_utils/utils';
import { GroupedQuizSet, QuizSetResponse } from '../../../_type/type';
import { columns } from './columns';
import { hqColumns } from './hq-columns';

interface QuizSetDataTableProps {
  data: GroupedQuizSet[] | undefined;
  columns: ColumnDef<GroupedQuizSet>[];
}

export default function SplusDataTable({ data }: { data: QuizSetResponse }) {
  const groupedQuizSets = data.result.groupedQuizSets;

  const ORG_CODE_PRIORITY = 'OrgCode-7';
  const filteredGroupedQuizSets = groupedQuizSets.filter(
    (quizSet) => quizSet.domain.code !== ORG_CODE_PRIORITY
  );
  const HQquizSet = groupedQuizSets.filter(
    (quizSet) => quizSet.domain.code === ORG_CODE_PRIORITY
  );
  const sortedGroupedQuizSets = [...filteredGroupedQuizSets];

  return (
    <>
      <HQDataTable data={HQquizSet} columns={hqColumns} />
      {!isEmpty(sortedGroupedQuizSets) && (
        <DataTable data={sortedGroupedQuizSets} columns={columns} />
      )}
    </>
  );
}

function DataTable({ data = [], columns }: QuizSetDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowState, setRowState] = useState<{
    readyRows: Row<GroupedQuizSet>[];
    notReadyRows: Row<GroupedQuizSet>[];
  }>({ readyRows: [], notReadyRows: [] });

  const { readyRows, notReadyRows } = rowState;
  const campaignStartedAt = data[0].campaign.startedAt;
  const isPastStartDate = new Date(campaignStartedAt) < new Date();
  const filteredColumns = isPastStartDate
    ? columns.filter((col) => {
        return (col as any).accessorKey !== 'delete';
      })
    : columns;

  const table = useReactTable({
    data,
    columns: filteredColumns,
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

  const rows = table.getFilteredRowModel().rows;

  useEffect(() => {
    const { ready, notReady } = rows.reduce<{
      ready: Row<GroupedQuizSet>[];
      notReady: Row<GroupedQuizSet>[];
    }>(
      (acc, row) => {
        const { quizSetFile, activityBadges, uiLanguage } = row.original;
        const isReady =
          quizSetFile?.id && activityBadges?.length && uiLanguage?.code;

        acc[isReady ? 'ready' : 'notReady'].push(row);
        return acc;
      },
      { ready: [], notReady: [] }
    );

    setRowState((prevState) => ({
      readyRows: ready,
      notReadyRows: notReady,
    }));
  }, [table, rows]);

  const noSortData = ['url', 'quiz set', 'activity id', 'badge', 'ui language'];

  return (
    <div>
      <div className="flex items-center justify-between pt-[1.438rem] pb-2">
        <div className="flex items-center justify-end space-x-3 py-4">
          <div className="text-sm text-zinc-950">
            Total :
            <strong className="font-bold">
              {` ${table.getFilteredRowModel().rows.length}`}
            </strong>
          </div>
          <div className="w-[1px] h-3 bg-zinc-200" />
          <div className=" text-sm text-zinc-950">
            Ready :
            <strong className="font-bold">{` ${readyRows.length}`}</strong>
          </div>
          <div className="w-[1px] h-3 bg-zinc-200" />
          <div className=" text-sm text-zinc-950">
            Not Ready :
            <strong className="font-bold">{` ${notReadyRows.length}`}</strong>
          </div>
        </div>
        <div className="relative w-[13.625rem]">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            placeholder="Search Domain"
            value={
              (table.getColumn('domain')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('domain')?.setFilterValue(event.target.value)
            }
            className="max-w-sm pl-9 placeholder:text-zinc-500 text-size-14px"
          />
        </div>
      </div>
      <div className="rounded-md border data-table">
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
                          header.id.toLowerCase() === 'url' ||
                          header.id.toLowerCase() === 'quizset' ||
                          header.id.toLowerCase() === 'activityid' ||
                          header.id.toLowerCase() === 'badge' ||
                          header.id.toLowerCase() === 'uilanguage' ||
                          header.id.toLowerCase() === 'delete'
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
            {table.getRowModel().rows.map((row) => {
              const isHQ = row.original.domain?.code === 'OrgCode-7';
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(isHQ && 'bg-[#EFF6FF80]')}
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function HQDataTable({ data = [], columns }: QuizSetDataTableProps) {
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

  return (
    <div className="mt-8 mb-4">
      <div className="rounded-md border data-table">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="p-4 text-nowrap" key={header.id}>
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
            {table.getRowModel().rows.map((row) => {
              const isHQ = row.original.domain?.code === 'OrgCode-7';
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(isHQ && 'bg-[#EFF6FF80]')}
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
