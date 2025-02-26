/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useUserContext } from '../_provider/provider';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import ChartContainer from '@/components/system/chart-container';
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
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { LoaderWithBackground } from '@/components/loader';
import { CardCustomHeaderWithDownload } from '@/components/system/chart-header';
import Pagination from '@/components/pagenation';
import { serializeJsonToQuery } from '@/lib/search-params';
import { updateSearchParamsOnUrl } from '@/lib/url';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';

const columns: ColumnDef<UserListProps>[] = [
  {
    id: 'no',
    header: 'No',
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      return pageIndex * pageSize + info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: 'providerUserId',
    header: 'Employee Id',
  },
  {
    accessorKey: 'lastCompletedStage',
    header: 'completed stage',
  },
];

const UserProgress = () => {
  const searchParams = useSearchParams();
  const page = (searchParams.get('progressPageIndex') as string | null) ?? '1';
  const { state } = useUserContext();
  const [pageIndex, setPageIndex] = useState(parseInt(page)); // 현재 페이지
  const pageSize = 50; // 페이지당 데이터 개수
  const { data: progressData, isLoading: loading } = useSWR(
    `/api/dashboard/user/progress?${searchParamsToQuery({ ...state.fieldValues, take: pageSize, page: pageIndex })}`,
    swrFetcher
  );

  const { result: data, total }: { result: UserListProps[]; total: 0 } =
    progressData || {
      result: [],
      total: 0,
    };

  const table = useReactTable({
    data, // 현재 페이지 데이터
    columns, // 테이블 컬럼 정의
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // 페이지네이션 모델 추가
    manualPagination: true, // 페이지네이션을 수동으로 처리
    pageCount: Math.ceil(total / pageSize), // 총 페이지 수 계산
    state: {
      pagination: {
        pageIndex: pageIndex - 1, // 0 기반 인덱스 적용
        pageSize, // 페이지당 데이터 수
      },
    },
  });

  useEffect(() => {
    if (state.fieldValues) {
      updateSearchParamsOnUrl({
        ...state.fieldValues,
        progressPageIndex: pageIndex,
      });
    }
  }, [state.fieldValues, pageIndex]);

  const onDownload = () => {
    if (state.fieldValues) {
      const searchParams = serializeJsonToQuery(state.fieldValues);
      const url = `/api/dashboard/user/progress/download?${searchParams.toString()}`;
      window.location.href = url;
    }
  };

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeaderWithDownload
        title="Stage Progress"
        onDownload={onDownload}
      />
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

      {/* 페이지네이션 컴포넌트 */}
      {table.getRowModel().rows?.length ? (
        <div className="py-5">
          <Pagination
            totalItems={total}
            pageSize={pageSize}
            currentPage={pageIndex}
            onPageChange={(page) => setPageIndex(page)}
          />
        </div>
      ) : (
        <></>
      )}
    </ChartContainer>
  );
};

export default UserProgress;
