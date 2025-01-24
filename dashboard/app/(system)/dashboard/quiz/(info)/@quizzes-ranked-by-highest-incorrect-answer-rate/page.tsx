"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { fetchData } from "../../../_lib/fetch";
import ChartContainer from "../../../_components/charts/chart-container";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LoaderWithBackground } from "@/components/loader";
import { CardCustomHeaderWithoutDesc } from "../../../_components/charts/chart-header";
import { ResponsiveContainer } from "recharts";
import Pagination from "../../../_components/pagenation";
import { useQuizContext } from "../../_provider/provider";
import IncorrectTable, { columns } from "../../_components/incorrect-table";

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
              <CardCustomHeaderWithoutDesc title="Quizzes Ranked by Highest Incorrect Answer Rate" />
              <div className="border rounded-md border-zinc-200">
                <IncorrectTable
                  table={table}
                  loading={loading}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                />
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
