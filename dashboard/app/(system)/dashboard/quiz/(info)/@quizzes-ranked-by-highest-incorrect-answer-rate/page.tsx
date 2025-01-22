/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
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
import { useQuizContext } from "../../_provider/provider";
import { formatSnakeToTitleCase } from "@/lib/text";

const columns: ColumnDef<QuizRankedIncorrectAnswerRateProps>[] = [
  {
    id: "no",
    header: "No",
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      return pageIndex * pageSize + info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: "question",
    header: "Question",
  },
  {
    accessorKey: "product",
    header: "Target Product",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "questionType",
    header: "Question Type",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return formatSnakeToTitleCase(value);
    },
  },
  {
    accessorKey: "importance",
    header: "Importance",
  },
  {
    accessorKey: "errorRate",
    header: "Error Rate",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return `${value.toLocaleString()}%`;
    },
  },
];

const QuizQuizzesRanked = () => {
  const { state } = useQuizContext();
  const [data, setData] = useState<QuizRankedIncorrectAnswerRateProps[]>([]);
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
        "quiz/info/quizzes-ranked-by-highest-incorrect-answer-rate",
        (data) => {
          total.current = data.total;
          setData(data.result);
          setLoading(false);
        }
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
              <CardCustomHeaderWithoutDesc title="Domain" />
              <div className="border rounded-md border-zinc-200">
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
                                width:
                                  header.id === "question" ? "50%" : "auto",
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

export default QuizQuizzesRanked;
