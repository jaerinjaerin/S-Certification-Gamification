'use client';
import { usePageIndex } from '@/components/hook/use-page-index';
import { LoaderWithBackground } from '@/components/loader';
import Pagination from '@/components/pagenation';
import { useStateVariables } from '@/components/provider/state-provider';
import ChartContainer from '@/components/system/chart-container';
import { CardCustomHeaderWithDownload } from '@/components/system/chart-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { swrFetcher } from '@/lib/fetch';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import useSWR from 'swr';

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
  const { campaign } = useStateVariables();
  const state = { fieldValues: Object.fromEntries(searchParams.entries()) };
  const [pageIndex, setPageIndex] = usePageIndex(
    searchParams,
    'progressPageIndex'
  );
  const pageSize = 50; // 페이지당 데이터 개수

  //
  const fallbackData = useMemo(() => ({ result: { data: [], total: 0 } }), []);
  const swrKey = useMemo(() => {
    return `/api/dashboard/report/user?${searchParams.toString()}&campaign=${campaign?.id}&take=${pageSize}&page=${pageIndex}`;
  }, [searchParams, campaign?.id, pageIndex, pageSize]);

  const { data: progressData, isLoading } = useSWR(swrKey, swrFetcher, {
    fallbackData,
  });

  const { data, total } = useMemo(() => progressData.result, [progressData]);

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

  const onDownload = () => {
    if (state.fieldValues) {
      const url = `/api/dashboard/report/user/download?${searchParams.toString()}`;
      window.location.href = url;
    }
  };

  const onDownloadBadgeLog = () => {
    if (state.fieldValues) {
      const url = `/api/dashboard/report/badge/download?${searchParams.toString()}&campaignId=${campaign?.id}`;
      window.location.href = url;
    }
  };

  return (
    <ChartContainer>
      {isLoading && <LoaderWithBackground />}
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
                  {isLoading ? '' : 'No results.'}
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
            onPageChange={setPageIndex}
          />
        </div>
      ) : (
        <></>
      )}
      <Button onClick={onDownloadBadgeLog} className="mt-5">
        Download BadgeLog
      </Button>
    </ChartContainer>
  );
};

export default UserProgress;
