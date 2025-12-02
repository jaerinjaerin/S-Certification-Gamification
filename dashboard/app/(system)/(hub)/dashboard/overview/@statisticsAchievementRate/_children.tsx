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
  chartColorGoal,
  chartColorExpert,
} from '@/app/(system)/(hub)/dashboard/_lib/chart-colors';
import { legendCapitalizeFormatter } from '@/app/(system)/(hub)/dashboard/_lib/text';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import CustomTooltip from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import { LoaderWithBackground } from '@/components/loader';
import { capitalize } from '@/lib/text';
import { CampaignSettings } from '@prisma/client';
import { swrFetcher } from '@/lib/fetch';
import { useMemo } from 'react';

const OverviewAchievementRateChild = () => {
  const { campaign } = useStateVariables();
  const settings = (campaign as Campaign)?.settings as CampaignSettings;
  const searchParams = useSearchParams();
  const fallbackData: [any, any] = useMemo(
    () => [{ result: { count: 0 } }, { result: [] }],
    []
  );
  const swrKey = useMemo(() => {
    return [
      `/api/dashboard/overview/info/achievement?${searchParams.toString()}&campaign=${campaign?.id}`,
      `/api/dashboard/overview/statistics/achievement?${searchParams.toString()}&campaign=${campaign?.id}`,
    ];
  }, [searchParams, campaign?.id]);
  const { data: dataycountData, isLoading } = useSWR(
    swrKey,
    ([infoUrl, statisticsUrl]) =>
      Promise.all([swrFetcher(infoUrl), swrFetcher(statisticsUrl)]),
    {
      revalidateOnFocus: false,
      fallbackData,
    }
  );

  const [
    {
      result: { count },
    },
    { result: data },
  ] = useMemo(
    () => (Array.isArray(dataycountData) ? dataycountData : fallbackData),
    [dataycountData]
  );

  return (
    <ChartContainer>
      {isLoading && <LoaderWithBackground />}
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
              stroke={chartColorGoal}
              startIndex={0}
              endIndex={9}
            />
          )}

          <Bar
            dataKey="goal"
            fill={chartColorGoal}
            activeBar={
              <Rectangle fill={chartColorGoal} stroke={chartColorGoal} />
            }
          />
          <Bar
            dataKey="expert"
            fill={chartColorExpert}
            name={capitalize(settings?.firstBadgeName || 'Expert')}
            activeBar={
              <Rectangle fill={chartColorExpert} stroke={chartColorExpert} />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default OverviewAchievementRateChild;
