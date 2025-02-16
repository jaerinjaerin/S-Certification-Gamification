'use client';
import { useEffect, useState } from 'react';
import { fetchData } from '../../_lib/fetch';
import ChartContainer from '../../_components/charts/chart-container';
import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { LoaderWithBackground } from '@/components/loader';
import { CardCustomHeaderWithoutDesc } from '../../_components/charts/chart-header';
import { useQuizContext } from '../_provider/provider';
import IncorrectTable, { columns } from '../_components/incorrect-table';
import { useAbortController } from '@/components/hook/use-abort-controller';

const QuizQuizzesRanked = () => {
  const { createController, abort } = useAbortController();
  const { state } = useQuizContext();
  const [data, setData] = useState<QuizRankedIncorrectAnswerRateProps[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        { ...state.fieldValues },
        'dashboard/quiz/info/quizzes-ranked-by-highest-incorrect-answer-rate',
        (data) => {
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
  }, [state.fieldValues]);

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
