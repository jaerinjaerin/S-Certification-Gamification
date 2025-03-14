'use client';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import {
  chartColorHoverBackground,
  chartColorPrimary,
} from '@/app/(system)/(hub)/dashboard/_lib/chart-colors';
import CustomTooltip, {
  CustomTimeTooltip,
} from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import ChartContainer from '@/components/system/chart-container';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { LoaderWithBackground } from '@/components/loader';
import { swrFetcher } from '@/lib/fetch';
import { useMemo } from 'react';

const UserOutcomeChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const fallbackData: [any, any] = useMemo(
    () => [{ result: [] }, { result: [] }],
    []
  );
  const swrKey = useMemo(() => {
    return [
      `/api/dashboard/user/statistics/outcome/average-score?${searchParams.toString()}&campaign=${campaign?.id}`,
      `/api/dashboard/user/statistics/outcome/total-quiz-completion-time?${searchParams.toString()}&campaign=${campaign?.id}`,
    ];
  }, [searchParams, campaign?.id]);
  const { data: scoreytimeData, isLoading } = useSWR(
    swrKey,
    ([scoreUrl, timeUrl]) =>
      Promise.all([swrFetcher(scoreUrl), swrFetcher(timeUrl)]),
    {
      revalidateOnFocus: false,
      fallbackData,
    }
  );

  const [{ result: score }, { result: time }] = useMemo(
    () => (Array.isArray(scoreytimeData) ? scoreytimeData : fallbackData),
    [scoreytimeData]
  );

  return (
    <ChartContainer>
      {isLoading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="Outcome" />
      <div className="flex w-full">
        <div className="relative w-1/2 flex items-center flex-col space-y-5">
          <div className="text-size-14px text-zinc-950 font-semibold">
            Average score
          </div>
          <ResponsiveContainer width="100%" height={chartHeight / 1.5}>
            <BarChart
              data={score}
              barSize={40}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" className="text-size-12px" />
              <YAxis className="text-size-12px" />
              <Tooltip
                cursor={{ fill: chartColorHoverBackground }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="score" fill={chartColorPrimary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="relative w-1/2 flex items-center flex-col space-y-5">
          <div className="text-size-14px text-zinc-950 font-semibold">
            Total quiz completion time
          </div>
          <ResponsiveContainer width="100%" height={chartHeight / 1.5}>
            <ComposedChart
              data={time}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartColorPrimary}
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColorPrimary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" className="text-size-12px" />
              <YAxis className="text-size-12px" />
              <Tooltip content={<CustomTimeTooltip />} />
              <Area
                type="linear"
                dataKey="time"
                stroke={chartColorPrimary}
                fill="url(#gradientColor)" // 그라데이션을 fill에 적용
              />
              <Line type="linear" dataKey="time" stroke={chartColorPrimary} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};

export default UserOutcomeChild;
