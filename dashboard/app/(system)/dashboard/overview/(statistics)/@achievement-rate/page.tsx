'use client';

export const dynamic = 'force-dynamic';
export const cache = 'no-store';

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
import CardCustomHeader from '../../../_components/charts/chart-header';
import ChartContainer from '../../../_components/charts/chart-container';
import {
  chartColorHoverBackground,
  chartColorPrimary,
  chartColorSecondary,
} from '../../../_lib/chart-colors';
import { useEffect, useState } from 'react';
import { fetchData } from '../../../_lib/fetch';
import { useOverviewContext } from '../../_provider/provider';
import { legendCapitalizeFormatter } from '../../../_lib/text';
import { chartHeight } from '../../../_lib/chart-variable';
import { LoaderWithBackground } from '@/components/loader';
import CustomTooltip from '../../../_components/charts/chart-tooltip';

function OverviewAchievementRate() {
  const { state } = useOverviewContext();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'overview/statistics/achievement',
        (data) => {
          setData(data.result);
          setLoading(false);
        }
      );
      //
      fetchData(state.fieldValues, 'overview/info/achievement', (data) => {
        setCount(data.result.count);
      });
    }

    return () => {
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
          <Brush
            dataKey="name"
            height={20}
            stroke={chartColorPrimary}
            startIndex={0}
            endIndex={9}
          />
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
