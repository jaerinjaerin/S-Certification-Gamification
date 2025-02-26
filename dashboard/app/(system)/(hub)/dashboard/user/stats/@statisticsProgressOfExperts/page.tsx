'use client';
import {
  Bar,
  Brush,
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
  chartColorSecondary,
} from '@/app/(system)/(hub)/dashboard/_lib/chart-colors';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import { useUserContext } from '../../_provider/provider';
import { LoaderWithBackground } from '@/components/loader';
import CustomTooltip from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import ChartContainer from '@/components/system/chart-container';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';
import { getUserExpertsProgress } from '@/app/actions/dashboard/user/action';

export function UserProgressExperts() {
  const { campaign } = useStateVariables();
  const { state } = useUserContext();
  const { data: expertData, isLoading: loading } = useSWR(
    {
      key: 'getUserExpertsProgress',
      ...state.fieldValues,
      campaign: campaign?.id,
    },
    getUserExpertsProgress
  );
  const data = expertData || [];
  //
  // const { data: expertData, isLoading: loading } = useSWR(
  //   `/api/dashboard/user/statistics/progress-of-experts?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
  //   swrFetcher
  // );
  // const { result: data } = expertData || { result: [] };

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="Progress of Experts" />
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
          <XAxis type="category" dataKey="date" />
          <YAxis type="number" />
          <Tooltip
            cursor={{ fill: chartColorHoverBackground }}
            content={<CustomTooltip />}
          />
          <Legend iconSize={8} />

          {data.length > 6 && (
            <Brush
              dataKey="date"
              height={20}
              stroke={chartColorPrimary}
              startIndex={0}
              endIndex={5}
            />
          )}

          {/* Job 데이터의 모든 Bar를 생성 */}
          <Bar
            name="Expert"
            dataKey="expert" // `FF`의 데이터 값
            stackId="a"
            fill={chartColorPrimary}
          />
          <Bar
            name="Expert + Advanced"
            dataKey="advanced" // `FSM`의 데이터 값
            stackId="a"
            fill={chartColorSecondary}
          />
          <Line
            name="Total"
            type="linear"
            strokeDasharray={2}
            dataKey="total"
            stroke={chartColorLineStroke}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default UserProgressExperts;
