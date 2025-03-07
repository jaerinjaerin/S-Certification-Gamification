/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
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
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import Pagination from '@/components/pagenation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useStateVariables } from '@/components/provider/state-provider';
import useSWR from 'swr';
import { searchParamsToJson } from '@/lib/query';
import { getUserDomain } from '@/app/actions/dashboard/user/action';
import { useEffect, useRef, useState } from 'react';
import { LoaderWithBackground } from '@/components/loader';

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

const UserDomainChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const page = parseInt(
    (searchParams.get('domainPageIndex') as string | null) ?? '1'
  );
  const pageSize = 10;
  const [pageIndex, setPageIndex] = useState(page);
  const [data, setData] = useState<DomainProps[] | any>([]);
  const total = useRef(0);
  const { data: domainData, isLoading } = useSWR(
    {
      ...searchParamsToJson(searchParams),
      key: 'getUserDomain',
      campaign: campaign?.id,
      take: pageSize,
      page: pageIndex,
    },
    getUserDomain
  );

  useEffect(() => {
    if (domainData) {
      total.current = domainData.total;
      setData(domainData.result);
    }
  }, [domainData]);

  const table = useReactTable({
    data, // 현재 페이지 데이터
    columns: columns as any, // 테이블 컬럼 정의
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

  return (
    <ChartContainer>
      {isLoading && <LoaderWithBackground />}
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
            totalItems={total.current}
            pageSize={pageSize}
            currentPage={pageIndex}
            onPageChange={(page) => {
              setPageIndex(page);
              // const params = Object.fromEntries(searchParams.entries());
              // router.push(
              //   `${pathname}?${serializeJsonToQuery({ ...params, domainPageIndex: page })}`
              // );
            }}
          />
        </div>
      ) : (
        <></>
      )}
    </ChartContainer>
  );
};

export default UserDomainChild;
