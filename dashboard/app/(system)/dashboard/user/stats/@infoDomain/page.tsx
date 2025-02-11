/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../../_provider/provider';
import { fetchData } from '../../../_lib/fetch';
import ChartContainer from '../../../_components/charts/chart-container';
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
import { CardCustomHeaderWithoutDesc } from '../../../_components/charts/chart-header';
import Pagination from '../../../_components/pagenation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAbortController } from '@/components/hook/use-abort-controller';

const columns: ColumnDef<DomainProps>[] = [
  {
    id: 'no',
    header: 'No',
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      return pageIndex * pageSize + info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ getValue }) => {
      const value = getValue<{ id: string; name: string }>();
      return value ? value.name : '';
    },
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
    cell: ({ getValue }) => {
      const value = getValue<{ id: string; name: string }>();
      return value ? value.name : '';
    },
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
    cell: ({ getValue }) => {
      const value = getValue<{ id: string; name: string }>();
      return value ? value.name : '';
    },
  },
  {
    accessorKey: 'goal',
    header: 'Goal',
  },
  {
    accessorKey: 'expert',
    header: 'Expert(Advanced)',
    cell: ({ row }) => {
      const expert = row.original.expert;
      const { date, country, ...expertDetail } = row.original.expertDetail;

      return (
        <TooltipProvider delayDuration={0}>
          <div className="flex items-center place-self-center">
            <span>{expert}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="link" className="w-0">
                  <Info className="w-4 h-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="w-[17.125rem] text-sm bg-background shadow-sm p-5 border"
                side="right"
                align="center"
                style={{ marginLeft: '1rem' }}
              >
                <div className="flex flex-col space-y-3 text-zinc-500 bg-background">
                  <div className="flex space-x-3">
                    <div>
                      {new Date(date).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </div>
                    <div> {country}</div>
                  </div>
                  {Object.entries(expertDetail).map(([key, value]) => {
                    let keyName = key.toUpperCase();
                    if (key.toLowerCase() === 'plus') keyName = 'S+';
                    else if (key.toLowerCase() === 'none') keyName = 'Non S+';
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <strong className="text-zinc-950 font-bold">
                          {keyName}
                        </strong>
                        <strong className="text-zinc-950 font-bold">
                          {value}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: 'achievement',
    header: 'Achievement rate',
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return `${value ? value.toLocaleString() : 0}%`;
    },
  },
];

const UserDomain = () => {
  const { createController, abort } = useAbortController();
  const { state } = useUserContext();
  const [data, setData] = useState<DomainProps[]>([]);
  const [loading, setLoading] = useState(true);
  const total = useRef<number>(0);

  // 페이지 상태 관리
  const [pageIndex, setPageIndex] = useState(1); // 현재 페이지
  const pageSize = 10; // 페이지당 데이터 개수

  const table = useReactTable({
    data, // 현재 페이지 데이터
    columns, // 테이블 컬럼 정의
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // 페이지네이션 모델 추가
    manualPagination: true, // 페이지네이션을 수동으로 처리
    pageCount: Math.ceil(total.current / pageSize), // 총 페이지 수 계산
    state: {
      pagination: {
        pageIndex: pageIndex - 1, // 0 기반 인덱스 적용
        pageSize, // 페이지당 데이터 수
      },
    },
  });

  // 이전 fieldValues를 추적하기 위한 함수
  const prevFieldValues = useRef(state.fieldValues);

  function fieldValuesChanged() {
    const isChanged =
      JSON.stringify(prevFieldValues.current) !==
      JSON.stringify(state.fieldValues);
    prevFieldValues.current = state.fieldValues; // 현재 값을 업데이트
    return isChanged;
  }

  useEffect(() => {
    if (state.fieldValues) {
      if (fieldValuesChanged() && 1 < pageIndex) {
        setPageIndex(1);
        return;
      }

      fetchData(
        { ...state.fieldValues, take: pageSize, page: pageIndex },
        'user/info/domain',
        (data) => {
          total.current = data.total;
          setData(data.result);
          setLoading(false);
        },
        createController()
      );
    }

    return () => {
      abort();
      setLoading(true);
    };
  }, [state.fieldValues, pageIndex]);

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="Domain" />
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
            totalItems={total.current}
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

export default UserDomain;
