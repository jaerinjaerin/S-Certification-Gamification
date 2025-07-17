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
import saveAs from 'file-saver';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { exportBadgeLogExcel } from './actions/export-badge-log-base64';
import { exportFailedBadgeLogBase64 } from './actions/export-failed-badge-log-base64';

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
  const [loadingFailedBadgeLog, setLoadingFailedBadgeLog] =
    useState<boolean>(false);
  const [loadingBadgeLog, setLoadingBadgeLog] = useState<boolean>(false);

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
    if (campaign) {
      const queryString = searchParams.toString();
      const url = `/api/dashboard/report/user/download${queryString ? `?${queryString}&campaign=${campaign?.id}` : `?campaign=${campaign?.id}`}`;
      window.location.href = url;
    }
  };

  const onDownloadBadgeLog = async () => {
    try {
      if (loadingBadgeLog) {
        return;
      }

      if (campaign == null) {
        return;
      }

      setLoadingBadgeLog(true);
      const query = new URLSearchParams(searchParams.toString());

      const from = query.get('date.from');
      const to = query.get('date.to');

      if (!from || !to) {
        console.error('필수 기간 정보가 누락되었습니다.');
        return;
      }

      const period = {
        from: new Date(decodeURIComponent(from)),
        to: new Date(decodeURIComponent(to)),
      };

      const condition: Record<string, any> = {};
      query.forEach((value, key) => {
        if (!['date.from', 'date.to'].includes(key)) {
          condition[key] = value;
        }
      });

      const base64 = await exportBadgeLogExcel({
        condition,
        period,
        params: {
          campaignId: campaign.id,
        },
      });

      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const range = `${period.from.toISOString().split('T')[0]}_to_${
        period.to.toISOString().split('T')[0]
      }`;
      console.log('엑셀 다운로드 시작:', range);
      const filename = `badge_log_${range}.xlsx`;
      saveAs(blob, filename);
    } catch (err) {
      console.error('엑셀 다운로드 실패:', err);
    } finally {
      setLoadingBadgeLog(false);
    }
  };

  const onDownloadFailedBadgeLog = async () => {
    if (loadingFailedBadgeLog) {
      return;
    }

    if (campaign == null) {
      return;
    }

    try {
      setLoadingFailedBadgeLog(true);

      const query = new URLSearchParams(searchParams.toString());
      const from = query.get('date.from');
      const to = query.get('date.to');

      if (!from || !to) {
        console.error('기간 정보가 누락되었습니다.');
        return;
      }

      const period = {
        from: new Date(decodeURIComponent(from)),
        to: new Date(decodeURIComponent(to)),
      };

      const condition: Record<string, any> = {};
      query.forEach((value, key) => {
        if (!['date.from', 'date.to'].includes(key)) {
          condition[key] = value;
        }
      });

      const base64 = await exportFailedBadgeLogBase64({
        condition,
        period,
        params: { campaignId: campaign.id },
      });

      const byteArray = Uint8Array.from(atob(base64!), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const range = `${period.from.toISOString().split('T')[0]}_to_${
        period.to.toISOString().split('T')[0]
      }`;
      saveAs(blob, `badge_failed_log_${range}.xlsx`);
    } catch (err) {
      console.error('엑셀 다운로드 실패:', err);
    } finally {
      setLoadingFailedBadgeLog(true);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-5">
        <Button
          disabled={loadingBadgeLog}
          onClick={onDownloadBadgeLog}
          className="mt-5"
        >
          {loadingBadgeLog ? 'Downloading...' : 'Download BadgeLog'}
        </Button>
        <Button
          disabled={loadingFailedBadgeLog}
          onClick={onDownloadFailedBadgeLog}
          className="mt-5"
        >
          {loadingFailedBadgeLog
            ? 'Downloading...'
            : 'Download Failed BadgeLog'}
        </Button>
      </div>
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
      </ChartContainer>
    </div>
  );
};

export default UserProgress;
