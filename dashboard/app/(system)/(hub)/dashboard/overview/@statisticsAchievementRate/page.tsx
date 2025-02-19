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
import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/fetch';
import { useOverviewContext } from '../_provider/provider';
import { legendCapitalizeFormatter } from '@/app/(system)/(hub)/dashboard/_lib/text';
import { chartHeight } from '@/app/(system)/(hub)/dashboard/_lib/chart-variable';
import { LoaderWithBackground } from '@/components/loader';
import CustomTooltip from '@/app/(system)/(hub)/dashboard/_components/charts/chart-tooltip';
import { useAbortController } from '@/components/hook/use-abort-controller';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';

function OverviewAchievementRate() {
  const { createController, abort } = useAbortController();
  const { createController: createControllerInfo, abort: abortInfo } =
    useAbortController();
  const { state } = useOverviewContext();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'dashboard/overview/statistics/achievement',
        (data) => {
          console.log('🚀 ~ useEffect ~ data.result:', data.result);
          setData(data.result);
          setLoading(false);
        },
        createController()
      );
      //
      fetchData(
        state.fieldValues,
        'dashboard/overview/info/achievement',
        (data) => {
          setCount(data.result.count.toFixed(2) ?? 0);
        },
        createControllerInfo()
      );
    }

    return () => {
      abort();
      abortInfo();
      setLoading(true);
    };
  }, [state.fieldValues]);

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
