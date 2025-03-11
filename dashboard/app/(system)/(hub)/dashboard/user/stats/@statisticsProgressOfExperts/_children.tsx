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
import CustomTooltip from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import ChartContainer from '@/components/system/chart-container';
import { useStateVariables } from '@/components/provider/state-provider';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { LoaderWithBackground } from '@/components/loader';
import { CampaignSettings } from '@prisma/client';
import { capitalize } from '@/lib/text';
import { swrFetcher } from '@/lib/fetch';

export function UserProgressExpertsChild() {
  const { campaign } = useStateVariables();
  const settings = (campaign as Campaign).settings as CampaignSettings;
  const searchParams = useSearchParams();
  const { data: progressData, isLoading } = useSWR(
    `/api/dashboard/user/statistics/progress-of-experts?${searchParams.toString()}&campaign=${campaign?.id}`,
    swrFetcher,
    { fallbackData: { result: [] } }
  );

  const data = progressData.result;

  return (
    <ChartContainer>
      {isLoading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc
        title={`Progress of ${capitalize(settings?.firstBadgeName || 'Expert')}s`}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          title={`${capitalize(settings?.firstBadgeName || 'Expert')}s distribution`}
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
            name={capitalize(settings?.firstBadgeName || 'Expert')}
            dataKey="expert"
            stackId="a"
            fill={chartColorPrimary}
          />
          {(settings?.ffSecondBadgeStageIndex ||
            settings?.fsmSecondBadgeStageIndex) && (
            <Bar
              name={capitalize(settings?.secondBadgeName || 'Advanced')}
              dataKey="advanced"
              stackId="a"
              fill={chartColorSecondary}
            />
          )}

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

export default UserProgressExpertsChild;
