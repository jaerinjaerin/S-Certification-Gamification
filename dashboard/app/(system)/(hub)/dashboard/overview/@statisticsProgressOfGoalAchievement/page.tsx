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
import { useOverviewContext } from '../_provider/provider';
import { useEffect, useRef, useState } from 'react';
import { fetchData } from '@/lib/fetch';
import { LoaderWithBackground } from '@/components/loader';
import { ProgressTooltip } from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import { useAbortController } from '@/components/hook/use-abort-controller';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';

export function OverviewGoalAchievement() {
  const { createController, abort } = useAbortController();
  const { state } = useOverviewContext();
  const [data, setData] = useState([]);
  const count = useRef(0);
  const expertRange = useRef(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'dashboard/overview/statistics/progress-of-goal-achievement',
        (data) => {
          const { jobData, goalTotalScore, cumulativeRate } = data.result;
          count.current = cumulativeRate;
          expertRange.current = goalTotalScore;
          setData(jobData);
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
      <CardCustomHeader
        title="Progress of goal achievement"
        numbers={`${count.current?.toFixed(2) || '0.00'}%`}
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
          <YAxis type="number" domain={[0, expertRange.current]} />
          <Tooltip
            cursor={{ fill: chartColorHoverBackground }}
            content={<ProgressTooltip goal={expertRange.current} />}
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
}

export default OverviewGoalAchievement;
