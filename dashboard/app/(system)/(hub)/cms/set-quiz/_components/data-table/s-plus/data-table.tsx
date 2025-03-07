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
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { GroupedQuizSet, QuizSetResponse } from '../../../_type/type';
import { columns } from './columns';

interface QuizSetDataTableProps {
  data: GroupedQuizSet[] | undefined;
  columns: ColumnDef<GroupedQuizSet>[];
}

export default function SplusDataTable({ data }: { data: QuizSetResponse }) {
  return <DataTable data={data.result.groupedQuizSets} columns={columns} />;
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

  return (
    <div>
      <div className="flex items-center justify-between pt-[1.438rem] pb-2">
        <div className="flex items-center justify-end space-x-3 py-4">
          {/* Total: {table.getFilteredRowModel().rows.length}, Domain:
          {new Set(data.map((item) => item.quizSet.domain.id)).size} */}
          <div className=" text-sm text-zinc-950">
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
            placeholder="Search"
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
      {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}

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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
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
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
