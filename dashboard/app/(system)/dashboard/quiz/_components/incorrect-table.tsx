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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const columns: ColumnDef<QuizRankedIncorrectAnswerRateProps>[] = [
  {
    id: 'no',
    header: 'No',
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      return pageIndex * pageSize + info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: 'question',
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
    header: 'Error Rate',
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return `${value.toLocaleString()}%`;
    },
  },
];

const IncorrectTable = ({
  table,
  loading,
  pageIndex = 1,
  pageSize = 0,
}: {
  table: TableProps<QuizRankedIncorrectAnswerRateProps>;
  loading: boolean;
  pageIndex?: number;
  pageSize?: number;
}) => {
  return (
    <ScrollArea className="w-full">
      <div className="max-h-[25.6rem]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-[2.5625rem]">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-nowrap font-medium text-center text-size-14px text-zinc-500"
                      onClick={header.column.getToggleSortingHandler()} // 헤더 클릭 시 정렬 변경
                      style={{
                        width: header.id === 'question' ? '50%' : 'auto',
                      }}
                    >
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? '' : 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export default IncorrectTable;
