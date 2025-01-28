'use client';
export const dynamic = 'force-dynamic';
export const cache = 'no-store';

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
import { CardCustomHeaderWithoutDesc } from '../../../_components/charts/chart-header';
import {
  chartColorHoverBackground,
  chartColorLineStroke,
  chartColorPrimary,
  chartColorSecondary,
} from '../../../_lib/chart-colors';
import { chartHeight } from '../../../_lib/chart-variable';
import { useUserContext } from '../../_provider/provider';
import { useEffect, useState } from 'react';
import { fetchData } from '../../../_lib/fetch';
import ChartContainer from '../../../_components/charts/chart-container';
import { LoaderWithBackground } from '@/components/loader';
import CustomTooltip from '../../../_components/charts/chart-tooltip';

export function UserProgressExperts() {
  const { state } = useUserContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'user/statistics/progress-of-experts',
        (data) => {
          setData(data.result);
          setLoading(false);
        }
      );
    }

    return () => {
      setLoading(true);
    };
  }, [state.fieldValues]);

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="Progess of Experts" />
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
