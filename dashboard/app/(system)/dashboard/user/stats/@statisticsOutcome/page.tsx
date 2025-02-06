'use client';
export const dynamic = 'force-dynamic';
export const cache = 'no-store';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../_provider/provider';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchData } from '../../../_lib/fetch';
import ChartContainer from '../../../_components/charts/chart-container';
import { CardCustomHeaderWithoutDesc } from '../../../_components/charts/chart-header';
import { chartHeight } from '../../../_lib/chart-variable';
import {
  chartColorHoverBackground,
  chartColorPrimary,
} from '../../../_lib/chart-colors';
import { LoaderWithBackground } from '@/components/loader';
import CustomTooltip, {
  CustomTimeTooltip,
} from '../../../_components/charts/chart-tooltip';

const UserOutcome = () => {
  const { state } = useUserContext();
  const [data, setData] = useState({ score: [], time: [] });
  const [loading, setLoading] = useState({ score: true, time: true });

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        'user/statistics/outcome/average-score',
        (data) => {
          setData((v) => ({ ...v, score: data.result }));
          setLoading((v) => ({ ...v, score: false }));
        }
      );
      //
      fetchData(
        state.fieldValues,
        'user/statistics/outcome/total-quiz-completion-time',
        (data) => {
          setData((v) => ({ ...v, time: data.result }));
          setLoading((v) => ({ ...v, time: false }));
        }
      );
      //
    }

    return () => {
      setLoading({ score: true, time: true });
    };
  }, [state.fieldValues]);

  return (
    <ChartContainer>
      {loading.score && loading.time && <LoaderWithBackground />}
      <CardCustomHeaderWithoutDesc title="Outcome" />
      <div className="flex w-full">
        <div className="relative w-1/2 flex items-center flex-col space-y-5">
          <div className="text-size-14px text-zinc-950 font-semibold">
            Average score
          </div>
          <ResponsiveContainer width="100%" height={chartHeight / 1.5}>
            <BarChart
              data={data.score}
              barSize={40}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" className="text-size-12px" />
              <YAxis className="text-size-12px" />
              <Tooltip
                cursor={{ fill: chartColorHoverBackground }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="score" fill={chartColorPrimary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="relative w-1/2 flex items-center flex-col space-y-5">
          <div className="text-size-14px text-zinc-950 font-semibold">
            Total quiz completion time
          </div>
          <ResponsiveContainer width="100%" height={chartHeight / 1.5}>
            <ComposedChart
              data={data.time}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartColorPrimary}
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColorPrimary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" className="text-size-12px" />
              <YAxis className="text-size-12px" />
              <Tooltip content={<CustomTimeTooltip />} />
              <Area
                type="linear"
                dataKey="time"
                stroke={chartColorPrimary}
                fill="url(#gradientColor)" // 그라데이션을 fill에 적용
              />
              <Line type="linear" dataKey="time" stroke={chartColorPrimary} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};

export default UserOutcome;
