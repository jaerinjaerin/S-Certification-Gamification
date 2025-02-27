'use client';
import { useState } from 'react';
import ChartContainer from '@/components/system/chart-container';
import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { LoaderWithBackground } from '@/components/loader';
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import { useQuizContext } from '../_provider/provider';
import IncorrectTable, { columns } from '../_components/incorrect-table';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';
import { getQuizRankByIncorrectAnswer } from '@/app/actions/dashboard/quiz/action';

const QuizQuizzesRanked = () => {
  const { campaign } = useStateVariables();
  const { state } = useQuizContext();
  const { data: incorrects, isLoading: loading } = useSWR(
    {
      key: 'getQuizRankByIncorrectAnswer',
      ...state.fieldValues,
      campaign: campaign?.id,
    },
    getQuizRankByIncorrectAnswer
  );
  const data: QuizRankedIncorrectAnswerRateProps[] = incorrects || [];
  //
  // const { data: incorrects, isLoading: loading } = useSWR(
  //   `/api/dashboard/quiz/info/quizzes-ranked-by-highest-incorrect-answer-rate?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
  //   swrFetcher
  // );
  // const { result: data }: { result: QuizRankedIncorrectAnswerRateProps[] } =
  //   incorrects || { result: [] };
  //
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data, // 현재 페이지 데이터
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
      {loading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="Quizzes Ranked by Highest Incorrect Answer Rate" />
      <div className="border rounded-md border-zinc-200">
        <IncorrectTable table={table} loading={loading} />
      </div>
    </ChartContainer>
  );
};

export default QuizQuizzesRanked;
