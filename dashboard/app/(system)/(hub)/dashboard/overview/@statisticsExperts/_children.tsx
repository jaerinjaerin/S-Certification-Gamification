/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomTooltip, {
  ExpertsTooltip,
} from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import {
  chartColorHoverBackground,
  chartColorPrimary,
  chartColorSecondary,
} from '@/app/(system)/(hub)/dashboard/_lib/chart-colors';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';
import { swrFetcher } from '@/lib/fetch';
import { CampaignSettings } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useSWR from 'swr';

const COLORS = [chartColorPrimary, chartColorSecondary];

const OverviewExpertsChild = () => {
  const { campaign } = useStateVariables() as { campaign: Campaign };
  const settings = (campaign as Campaign)?.settings as CampaignSettings;
  const searchParams = useSearchParams();
  const { data: expertsData, isLoading } = useSWR(
    `/api/dashboard/overview/statistics/experts?${searchParams.toString()}&campaign=${campaign?.id}`,
    swrFetcher,
    {
      fallbackData: {
        result: {
          pie: [],
          bar: [],
          count: 0,
        },
      },
    }
  );

  const data = removeAdvanced(expertsData.result, settings?.secondBadgeName);

  return (
    <ChartContainer>
      {isLoading && <LoaderWithBackground />}
      <CardCustomHeader
        title="Experts"
        numbers={data.count?.toLocaleString()}
        description="Number of people completed"
      />
      <div className="flex items-center">
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data?.pie}
                innerRadius={50}
                outerRadius={120}
                fill={chartColorPrimary}
                dataKey="value"
                label={({ name, value }) => {
                  console.log('🚀 ~ OverviewExpertsChild ~ name:', name);
                  return `${name}: ${value.toLocaleString()}`;
                }} // 각 영역에 Label 추가
              >
                {data?.pie
                  .map(
                    (entry: { name: string; value: number }, index: number) => {
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          name={
                            entry.name === 'expert'
                              ? settings?.firstBadgeName || 'Expert'
                              : settings?.secondBadgeName || 'Advanced'
                          }
                        />
                      );
                    }
                  )
                  .filter(Boolean)}
              </Pie>
              <>
                <text
                  x="50%"
                  y="47%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-bold text-size-20px opacity-90"
                >
                  {data.count?.toLocaleString()}
                </text>
                <text
                  x="50%"
                  y="51%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-size-12px"
                >
                  total
                </text>
              </>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center flex-col w-1/2">
          <div className="text-size-14px text-zinc-950 font-semibold">
            Experts distribution
          </div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              title="Experts distribution"
              data={data?.bar}
              barSize={40}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                orientation="top"
                // domain={[200, 1000]}
              />
              <YAxis type="category" dataKey="name" tick={renderCustomTick} />
              <Tooltip
                cursor={{ fill: chartColorHoverBackground }}
                content={<ExpertsTooltip />}
              />
              <Legend />
              <Bar
                dataKey="expert"
                name={settings?.firstBadgeName || 'Expert'}
                stackId="a"
                fill={chartColorPrimary}
              >
                <LabelList
                  dataKey="expert"
                  name={settings?.firstBadgeName || 'Expert'}
                  content={renderLabelContent}
                />
              </Bar>
              {settings?.secondBadgeName && (
                <Bar
                  dataKey="advanced"
                  name={settings.secondBadgeName}
                  stackId="a"
                  fill={chartColorSecondary}
                >
                  <LabelList
                    dataKey="advanced"
                    name={settings.secondBadgeName}
                    content={renderLabelContent}
                  />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};

export default OverviewExpertsChild;

const renderLabelContent = (props: any) => {
  if (props.value === 0) return;
  //
  const { x, y, width, value } = props;
  const padding = 5;

  if (width < 30) {
    return null;
  } else {
    return (
      <text
        x={x + width - padding}
        y={y + padding + 8}
        textAnchor="end"
        dominantBaseline="middle"
      >
        {value.toLocaleString()}
      </text>
    );
  }
};

const renderCustomTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill="rgba(0, 0, 0, 0.7)"
      className="text-size-12px"
    >
      {payload.value}
    </text>
  );
};

function removeAdvanced(data: any, secondBadgeName: string | null) {
  if (!secondBadgeName) {
    // secondBadgeName이 null 또는 빈값일 경우
    return {
      pie: data.pie.filter((item: any) => item.name !== 'advanced'),
      bar: data.bar.map(
        ({ name, expert }: { name: string; expert: number }) => ({
          name,
          expert,
        })
      ),
      count: data.pie.find((item: any) => item.name === 'expert')?.value || 0,
    };
  }
  return data; // secondBadgeName이 존재하면 원본 데이터 반환
}
