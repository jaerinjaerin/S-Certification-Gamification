'use client';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  chartColorHoverBackground,
  chartColorPrimary,
  chartColorSecondary,
} from '@/app/(system)/(hub)/dashboard/_lib/chart-colors';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import { useOverviewContext } from '../_provider/provider';
import { legendCapitalizeFormatter } from '@/app/(system)/(hub)/dashboard/_lib/text';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import { LoaderWithBackground } from '@/components/loader';
import CustomTooltip from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';

function OverviewAchievementRate() {
  const { campaign } = useStateVariables();
  const { state } = useOverviewContext();
  const { data: dataycount, isLoading: loading } = useSWR(
    [
      `/api/dashboard/overview/statistics/achievement?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
      `/api/dashboard/overview/info/achievement?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
    ],
    (urls) => Promise.all(urls.map(swrFetcher))
  );

  const [
    { result: data },
    {
      result: { count },
    },
  ] = dataycount || [{ result: [] }, { result: { count: 0 } }];

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeader
        title="Achievement Rate"
        numbers={`${count.toLocaleString()}%`}
        description="Displays goal achievement progress"
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          margin={{
            top: 30,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            cursor={{ fill: chartColorHoverBackground }}
            content={<CustomTooltip />}
          />
          <Legend iconSize={8} formatter={legendCapitalizeFormatter} />

          {data.length > 10 && (
            <Brush
              dataKey="name"
              height={20}
              stroke={chartColorPrimary}
              startIndex={0}
              endIndex={9}
            />
          )}

          <Bar
            dataKey="goal"
            fill={chartColorPrimary}
            activeBar={
              <Rectangle fill={chartColorPrimary} stroke={chartColorPrimary} />
            }
          />
          <Bar
            dataKey="expert"
            fill={chartColorSecondary}
            activeBar={
              <Rectangle
                fill={chartColorSecondary}
                stroke={chartColorSecondary}
              />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default OverviewAchievementRate;
