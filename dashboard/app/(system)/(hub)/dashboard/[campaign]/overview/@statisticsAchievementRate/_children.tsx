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
import { legendCapitalizeFormatter } from '@/app/(system)/(hub)/dashboard/_lib/text';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import CustomTooltip from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';
import {
  getAchievementProgress,
  getAchievementRate,
} from '@/app/actions/dashboard/overview/achievement-action';
import { searchParamsToJson } from '@/lib/query';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import { LoaderWithBackground } from '@/components/loader';
import { capitalize } from '@/lib/text';
import { CampaignSettings } from '@prisma/client';

const fetcher = async (params: any) => {
  const [data, count] = await Promise.all([
    getAchievementProgress({
      ...params,
      key: 'getAchievementProgress',
    }),
    getAchievementRate({
      ...params,
      key: 'getAchievementRate',
    }),
  ]);
  return { data, count };
};
const OverviewAchievementRateChild = () => {
  const { campaign } = useStateVariables();
  const settings = (campaign as Campaign).settings as CampaignSettings;
  const searchParams = useSearchParams();
  const { data: dataycountData, isLoading } = useSWR(
    {
      ...searchParamsToJson(searchParams),
      campaign: campaign?.id,
    },
    fetcher
  );
  console.log(
    '🚀 ~ OverviewAchievementRateChild ~ dataycountData:',
    dataycountData
  );

  const { data, count } = (dataycountData || {
    data: [],
    count: 0,
  }) as { data: any[]; count: number };

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
            name={capitalize(settings?.firstBadgeName || 'Expert')}
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
};

export default OverviewAchievementRateChild;
