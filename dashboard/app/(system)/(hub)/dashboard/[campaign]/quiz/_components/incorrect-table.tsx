/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  Table as TableProps,
} from '@tanstack/react-table';
import { formatSnakeToTitleCase } from '@/lib/text';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoaderWithBackground } from '@/components/loader';

export const columns: ColumnDef<any>[] = [
  {
    id: 'no',
    header: 'No',
    cell: (info) => {
      return info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: 'text',
    header: 'Question',
  },
  {
    accessorKey: 'product',
    header: 'Target Product',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'questionType',
    header: 'Question Type',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return formatSnakeToTitleCase(value);
    },
  },
  {
    accessorKey: 'importance',
    header: 'Importance',
  },
  {
    accessorKey: 'errorRate',
    id: 'errorRate',
    header: 'Error Rate',
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return `${value.toFixed(2)}%`; // Error Rate를 소수점 두 자리까지 표시
    },
    sortingFn: 'basic',
  },
];

const IncorrectTable = ({
  table,
  loading,
  pageIndex = 1,
  pageSize = 0,
}: {
  table: TableProps<any>;
  loading: boolean;
  pageIndex?: number;
  pageSize?: number;
}) => {
  return (
    <>
      {loading && <LoaderWithBackground />}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-[2.5625rem]">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-nowrap font-medium text-center text-size-14px text-zinc-500',
                      header.id === 'errorRate' && 'cursor-pointer'
                    )}
                    onClick={
                      header.id === 'errorRate'
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    style={{
                      width: header.id === 'question' ? '50%' : 'auto',
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.id === 'errorRate' && (
                          <>
                            {!header.column.getIsSorted() && (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                            {header.column.getIsSorted() === 'asc' && (
                              <ArrowUp className="ml-2 h-4 w-4" />
                            )}
                            {header.column.getIsSorted() === 'desc' && (
                              <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const id = row.id + pageIndex * pageSize;
              return (
                <TableRow key={id} className="h-[2.5625rem]">
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        className="font-medium text-center text-size-14px text-zinc-950"
                      >
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
                {loading ? '' : 'No results.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default IncorrectTable;
