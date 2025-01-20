/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
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
} from "recharts";
import CardCustomHeader from "../../../_components/charts/chart-header";
import {
  chartColorHoverBackground,
  chartColorLineStroke,
  chartColorPrimary,
  chartColorQuaternary,
  chartColorSecondary,
  chartColorTertiary,
} from "../../../_lib/chart-colors";
import { chartHeight } from "../../../_lib/chart-variable";
import { useOverviewContext } from "../../_provider/provider";
import { useEffect, useState } from "react";
import { fetchData } from "../../../_lib/fetch";
import ChartContainer from "../../../_components/charts/chart-container";

export function OverviewGoalAchievement() {
  const { state } = useOverviewContext();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "overview/statistics/progress-of-goal-achievement",
        (data) => {
          const { result } = data;
          setData(result);
          setCount(result[result.length - 1].target);
        }
      );
      //
    }
  }, [state.fieldValues]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer>
        {({ width }) => {
          return (
            <>
              <CardCustomHeader
                title="Progress of goal achievement"
                numbers={`${count.toLocaleString()}%`}
                description="Cumulative number of experts over time"
              />
              <div className="flex" style={{ width }}>
                <ComposedChart
                  title="Experts distribution"
                  width={width}
                  height={chartHeight}
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
                  <XAxis type="category" dataKey="name" />
                  <YAxis type="number" />
                  <Tooltip cursor={{ fill: chartColorHoverBackground }} />
                  <Legend iconSize={8} />
                  {/* Job 데이터의 모든 Bar를 생성 */}
                  <Bar
                    name="FF"
                    dataKey="job.ff" // `FF`의 데이터 값
                    stackId="a"
                    fill={chartColorPrimary}
                  />
                  <Bar
                    name="FSM"
                    dataKey="job.fsm" // `FSM`의 데이터 값
                    stackId="a"
                    fill={chartColorSecondary}
                  />
                  <Bar
                    name="FF(SES)"
                    dataKey="job.ff(ses)" // `FF(SES)`의 데이터 값
                    stackId="a"
                    fill={chartColorTertiary}
                  />
                  <Bar
                    name="FSM(SES)"
                    dataKey="job.fsm(ses)" // `FSM(SES)`의 데이터 값
                    stackId="a"
                    fill={chartColorQuaternary}
                  />
                  <Line
                    name="Target(%)"
                    type="monotone"
                    dataKey="target"
                    stroke={chartColorLineStroke}
                  />
                </ComposedChart>
              </div>
            </>
          );
        }}
      </ChartContainer>
    </ResponsiveContainer>
  );
}

export default OverviewGoalAchievement;
