'use client';
import { useState } from 'react';
import ChartContainer from '@/components/system/chart-container';
import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import IncorrectTable, { columns } from '../_components/incorrect-table';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { searchParamsToJson } from '@/lib/query';
import { getQuizRankByIncorrectAnswer } from '@/app/actions/dashboard/quiz/action';

const QuizQuizzesRankedChild = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data, isLoading } = useSWR(
    {
      ...searchParamsToJson(searchParams),
      key: 'getQuizRankByIncorrectAnswer',
      campaign: campaign?.id,
    },
    getQuizRankByIncorrectAnswer
  );

  const table = useReactTable({
    data: data || [], // 현재 페이지 데이터
    columns, // 테이블 컬럼 정의
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // 정렬 모델 활성화
    onSortingChange: setSorting, // 정렬 상태 관리
    state: {
      sorting,
    },
  });

  return (
    <ChartContainer>
      <CardCustomHeaderWithoutDesc title="Quizzes Ranked by Highest Incorrect Answer Rate" />
      <div className="border rounded-md border-zinc-200">
        <IncorrectTable table={table} loading={isLoading} />
      </div>
    </ChartContainer>
  );
};

export default QuizQuizzesRankedChild;
