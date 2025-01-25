/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";
import ChartContainer from "../../../_components/charts/chart-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LoaderWithBackground } from "@/components/loader";
import { CardCustomHeaderWithoutDesc } from "../../../_components/charts/chart-header";
import { ResponsiveContainer } from "recharts";
import Pagination from "../../../_components/pagenation";

const columns: ColumnDef<UserListProps>[] = [
  {
    id: "no",
    header: "No",
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      return pageIndex * pageSize + info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: "authType",
    header: "S+",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value === "SUMTOTAL" ? "S+ User" : "Non S+ User";
    },
  },
  {
    accessorKey: "providerUserId",
    header: "ID",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "subsidiary",
    header: "Subsidiary",
  },
  {
    accessorKey: "domain",
    header: "Domain",
    cell: ({ row }) => {
      const domain = row.original.domain;
      const quizDomain = row.original.quizDomain;
      const domainName = `${domain} (${quizDomain})`;
      if (domain != quizDomain) {
        return <span className={"text-red-500"}>{domainName}</span>;
      }
      return domain;
    },
  },
  {
    accessorKey: "expert",
    header: "Expert",
    cell: ({ row }) => {
      const lastCompletedStage = row.original.lastCompletedStage;
      if (lastCompletedStage === 3) {
        return (
          <div
            className={
              "text-orange-700 bg-orange-100 border-orange-300 border rounded-md text-size-10px font-medium"
            }
          >
            Expert Adv.
          </div>
        );
      } else if (lastCompletedStage === 2) {
        return (
          <div
            className={
              "text-purple-700 bg-purple-100 border-purple-300 border rounded-md text-size-10px font-medium"
            }
          >
            Expert
          </div>
        );
      } else {
        return (
          <div
            className={
              "text-gray-700 bg-gray-100 border-gray-300 border rounded-md text-size-10px font-medium"
            }
          >
            Not completed
          </div>
        );
      }
    },
  },
  {
    accessorKey: "activity-expert",
    header: "Expert Act. ID",
    cell: ({ row }) => {
      const badgeActivities = row.original.badgeActivities;
      return (
        badgeActivities.find((activity) => activity.order === 3)?.activityId ||
        ""
      );
    },
  },
  {
    accessorKey: "activity-advanced",
    header: "Adv. Act. ID",
    cell: ({ row }) => {
      const badgeActivities = row.original.badgeActivities;
      return (
        badgeActivities.find((activity) => activity.order === 4)?.activityId ||
        ""
      );
    },
  },
];

const UserList = () => {
  const { state } = useUserContext();
  const [data, setData] = useState<UserListProps[]>([]);
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

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        { ...state.fieldValues, take: pageSize, page: pageIndex },
        "user/info/list",
        (data) => {
          total.current = data.total;
          setData(data.result);
          setLoading(false);
        },
      );
    }

    return () => {
      setLoading(true);
    };
  }, [state.fieldValues, pageIndex]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer>
        {({ width }) => {
          return (
            <>
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
                                  header.getContext(),
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
                                    cell.getContext(),
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
                          {loading ? "" : "No results."}
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
            </>
          );
        }}
      </ChartContainer>
    </ResponsiveContainer>
  );
};

export default UserList;
