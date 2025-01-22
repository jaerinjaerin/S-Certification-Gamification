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
import { CardCustomHeaderWithoutDesc } from "../../../_components/charts/chart-header";
import {
  chartColorHoverBackground,
  chartColorLineStroke,
  chartColorPrimary,
  chartColorSecondary,
} from "../../../_lib/chart-colors";
import { chartHeight } from "../../../_lib/chart-variable";
import { useUserContext } from "../../_provider/provider";
import { useEffect, useState } from "react";
import { fetchData } from "../../../_lib/fetch";
import ChartContainer from "../../../_components/charts/chart-container";
import { LoaderWithBackground } from "@/components/loader";
import CustomTooltip from "../../../_components/charts/chart-tooltip";

export function UserProgressExperts() {
  const { state } = useUserContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "user/statistics/progress-of-experts",
        (data) => {
          setData(data.result);
          setLoading(false);
        }
      );
    }
  }, [state.fieldValues]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer>
        {({ width }) => {
          return (
            <>
              {loading && <LoaderWithBackground />}
              <CardCustomHeaderWithoutDesc title="Progess of Experts" />
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
              </div>
            </>
          );
        }}
      </ChartContainer>
    </ResponsiveContainer>
  );
}

export default UserProgressExperts;
