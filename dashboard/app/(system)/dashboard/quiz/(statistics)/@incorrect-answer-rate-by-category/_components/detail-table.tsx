"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { LoaderWithBackground } from "@/components/loader";
import { fetchData } from "@/app/(system)/dashboard/_lib/fetch";
import { CardCustomHeaderWithoutDesc } from "@/app/(system)/dashboard/_components/charts/chart-header";
import IncorrectTable, { columns } from "../../../_components/incorrect-table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useModal } from "@/components/provider/modal-provider";

const DetailIncorrectTable = ({
  category,
  group,
  questionIds,
}: {
  category: string;
  group: string;
  questionIds: string;
}) => {
  const { setContent } = useModal();
  const [data, setData] = useState<QuizRankedIncorrectAnswerRateProps[]>([]);
  const [loading, setLoading] = useState(true);

  const table = useReactTable({
    data, // 현재 페이지 데이터
    columns, // 테이블 컬럼 정의
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (questionIds) {
      fetchData(
        { questionIds },
        "quiz/statistics/incorrect-answer-rate-by-category/info",
        (data) => {
          setData(data.result);
          setLoading(false);
        }
      );
    }

    return () => {
      setLoading(true);
    };
  }, [questionIds]);

  return (
    <div>
      {loading && <LoaderWithBackground />}
      <div className="flex items-center justify-between px-3">
        <CardCustomHeaderWithoutDesc title="Incorrect answer details" />
        <Button variant="ghost" onClick={() => setContent(null)}>
          <X className="!w-6 !h-6" />
        </Button>
      </div>
      <div className="text-zinc-950 text-size-16px flex items-center space-x-2 capitalize px-3">
        <span>Selected:</span>
        <span className="text-size-12px font-semibold rounded-full bg-zinc-100 px-3 py-1">
          {category}
        </span>
        <span className="text-size-12px font-semibold rounded-full bg-zinc-100 px-3 py-1">
          {group}
        </span>
      </div>
      <div className="mt-5 border rounded-md max-h-[28.3rem] overflow-y-auto">
        <IncorrectTable table={table} loading={loading} />
      </div>
    </div>
  );
};

export default DetailIncorrectTable;
