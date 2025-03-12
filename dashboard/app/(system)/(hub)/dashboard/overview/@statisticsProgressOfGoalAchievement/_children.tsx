'use client';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  chartColorHoverBackground,
  chartColorLineStroke,
  chartColorPrimary,
  chartColorQuaternary,
  chartColorSecondary,
  chartColorTertiary,
} from '@/app/(system)/(hub)/dashboard/_lib/chart-colors';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import { ProgressTooltip } from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { LoaderWithBackground } from '@/components/loader';
import { swrFetcher } from '@/lib/fetch';

export const OverviewGoalAchievementChild = () => {
  const { campaign } = useStateVariables();
  const searchParams = useSearchParams();
  const { data: progressData, isLoading } = useSWR(
    `/api/dashboard/overview/statistics/progress-of-goal-achievement?${searchParams.toString()}&campaign=${campaign?.id}`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      fallbackData: {
        result: { jobData: [], goalTotalScore: 0, cumulativeRate: 0 },
      },
    }
  );

  const {
    jobData: data,
    goalTotalScore: expertRange,
    cumulativeRate: count,
  } = progressData.result || {
    jobData: [],
    goalTotalScore: 0,
    cumulativeRate: 0,
  };

  return (
    <ChartContainer>
      {isLoading && <LoaderWithBackground />}
      <CardCustomHeader
        title="Progress of goal achievement"
        numbers={`${count?.toFixed(2) || '0.00'}%`}
        description="Cumulative number of experts over time"
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          title="Experts distribution"
          data={data}
          barSize={40}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="category" dataKey="name" />
          <YAxis
            yAxisId="percentage"
            orientation="right"
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis type="number" domain={[0, expertRange]} />
          <Tooltip
            cursor={{ fill: chartColorHoverBackground }}
            content={<ProgressTooltip goal={expertRange} />}
          />
          <Legend iconSize={8} />
          {/* Job 데이터의 모든 Bar를 생성 */}
          <Bar
            name="FF"
            dataKey="job.ff" // `FF`의 데이터 값
            stackId="a"
            fill={chartColorPrimary}
          />
          <Bar
            name="FSM"
            dataKey="job.fsm" // `FSM`의 데이터 값
            stackId="a"
            fill={chartColorSecondary}
          />
          <Bar
            name="FF(SES)"
            dataKey="job.ff(ses)" // `FF(SES)`의 데이터 값
            stackId="a"
            fill={chartColorTertiary}
          />
          <Bar
            name="FSM(SES)"
            dataKey="job.fsm(ses)" // `FSM(SES)`의 데이터 값
            stackId="a"
            fill={chartColorQuaternary}
          />
          <Line
            yAxisId="percentage"
            name="Target(%)"
            strokeDasharray={2}
            type="linear"
            dataKey="target"
            stroke={chartColorLineStroke}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default OverviewGoalAchievementChild;
