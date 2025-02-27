/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import ChartContainer from '@/components/system/chart-container';
import { LoaderWithBackground } from '@/components/loader';
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShowPermissionList } from './ui/select';
import { Delete } from '@/components/dialog';
import axios from 'axios';
import { swrFetcher } from '@/lib/fetch';
import useSWR from 'swr';

const columns: ColumnDef<UserRole>[] = [
  {
    id: 'no',
    header: 'No',
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      return pageIndex * pageSize + info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: 'userId',
    header: 'User ID',
  },
  {
    accessorKey: 'loginName',
    header: 'User Name',
  },
  {
    accessorKey: 'roleName',
    header: 'Roll Name',
  },
  {
    accessorKey: 'permissions',
    header: 'Permission',
    size: 30,
    cell: ({
      row: {
        original: { roleName },
      },
      getValue,
    }) => {
      const values = getValue() as {
        id: string;
        name: string;
        permId: string;
      }[];

      return (
        <ShowPermissionList
          placeholder="Permission List"
          roleName={roleName}
          values={values}
        />
      );
    },
  },
];

const UserRole = () => {
  const {
    data: roleData,
    isLoading: loading,
    mutate,
  } = useSWR('/api/cms/role/user-role', swrFetcher);
  const { result: data }: { result: UserRole[] } = roleData || { result: [] };

  const table = useReactTable({
    data, // 현재 페이지 데이터
    columns: [
      ...columns,
      {
        accessorKey: 'id',
        header: 'Action',
        size: 10,
        cell: ({ getValue }) => {
          const id = getValue();
          return (
            <Delete
              onDelete={async () => {
                try {
                  const response = await axios.delete(
                    '/api/cms/role/user-role',
                    {
                      data: { id },
                    }
                  );
                  // console.log('Delete success:', response.data);
                  // 기존 데이터에서 삭제된 항목만 제거 (mutation)
                  mutate();
                } catch (error) {
                  console.error('Error deleting user:', error);
                }
              }}
            />
          );
        },
      },
    ], // 테이블 컬럼 정의
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="User Role" />
      <div className="border rounded-md border-zinc-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-[2.5625rem]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-medium text-center text-size-14px text-zinc-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const id = row.id;
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
    </ChartContainer>
  );
};

export default UserRole;
