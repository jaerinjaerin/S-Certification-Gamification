/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
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
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import Pagination from '@/components/pagenation';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';
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
    accessorKey: 'authType',
    header: 'S+',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value === 'SUMTOTAL' ? 'S+ User' : 'Non S+ User';
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'providerUserId',
    header: 'S+ ID',
  },
  {
    accessorKey: 'region',
    header: 'Region',
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
    cell: ({ row }) => {
      const domain = row.original.domain;
      const quizDomain = row.original.quizDomain;
      const domainName = `${domain} (${quizDomain})`;
      if (domain != quizDomain) {
        return <span className={'text-red-500'}>{domainName}</span>;
      }
      return domain;
    },
  },
  {
    accessorKey: 'expert',
    header: 'Expert',
    cell: ({ row }) => {
      const lastCompletedStage = row.original.lastCompletedStage;
      if (lastCompletedStage === 3) {
        return (
          <div
            className={
              'text-orange-700 bg-orange-100 border-orange-300 border rounded-md text-size-10px font-medium'
            }
          >
            Expert Adv.
          </div>
        );
      } else if (lastCompletedStage === 2) {
        return (
          <div
            className={
              'text-purple-700 bg-purple-100 border-purple-300 border rounded-md text-size-10px font-medium'
            }
          >
            Expert
          </div>
        );
      } else {
        return (
          <div
            className={
              'text-gray-700 bg-gray-100 border-gray-300 border rounded-md text-size-10px font-medium'
            }
          >
            Stage : {lastCompletedStage}
          </div>
        );
      }
    },
  },
  {
    accessorKey: 'activity-expert',
    header: 'Expert Act. ID',
    cell: ({ row }) => {
      if (row.original.authType !== 'SUMTOTAL') return '';
      const badgeActivities = row.original.badgeActivities;
      const activity = badgeActivities.find((activity) => activity.order === 3);
      if (activity) {
        const attended = activity.hasAttended ? '✅' : '⛔️';
        return `${activity.activityId} ${attended}`;
      } else {
        return '';
      }
    },
  },
  {
    accessorKey: 'activity-advanced',
    header: 'Adv. Act. ID',
    cell: ({ row }) => {
      if (row.original.authType !== 'SUMTOTAL') return '';
      const badgeActivities = row.original.badgeActivities;
      const activity = badgeActivities.find((activity) => activity.order === 4);
      if (activity) {
        const attended = activity.hasAttended ? '✅' : '⛔️';
        return `${activity.activityId} ${attended}`;
      } else {
        return '';
      }
    },
  },
];

const UserList = () => {
  const searchParams = useSearchParams();
  const { campaign } = useStateVariables();
  const page = (searchParams.get('usersPageIndex') as string | null) ?? '1';
  const state = { fieldValues: Object.fromEntries(searchParams.entries()) };
  const [pageIndex, setPageIndex] = useState(parseInt(page)); // 현재 페이지
  const pageSize = 10; // 페이지당 데이터 개수
  const { data: userData, isLoading: loading } = useSWR(
    `/api/dashboard/user/info/list?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id, take: pageSize, page: pageIndex })}`,
    swrFetcher
  );
  const { result: data, total }: { result: UserListProps[]; total: number } =
    userData || { result: [], total: 0 };

  // 페이지 상태 관리

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

  // useEffect(() => {
  //   if (state.fieldValues) {
  //     updateSearchParamsOnUrl({
  //       ...state.fieldValues,
  //       usersPageIndex: pageIndex,
  //     });
  //   }
  // }, [state.fieldValues, pageIndex]);

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="User" />
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
                          className="text-center text-xs text-zinc-950"
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

export default UserList;
