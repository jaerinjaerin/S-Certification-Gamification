"use client";
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
} from "recharts";
import CardCustomHeader from "../../../_components/charts/chart-header";
import ChartContainer from "../../../_components/charts/chart-container";
import {
  chartColorHoverBackground,
  chartColorPrimary,
  chartColorSecondary,
} from "../../../_lib/chart-colors";
import { useEffect, useState } from "react";
import { fetchData } from "../../../_lib/fetch";
import { useOverviewContext } from "../../_provider/provider";
import { legendFormatter } from "../../../_lib/text";
import { chartHeight } from "../../../_lib/chart-variable";

function OverviewAchievementRate() {
  const { state } = useOverviewContext();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "overview/statistics/achievement",
        (data) => {
          setData(data.result);
        }
      );
      //
      fetchData(state.fieldValues, "overview/info/achievement", (data) => {
        setCount(data.result.count);
      });
    }
  }, [state.fieldValues]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer>
        {({ width }) => {
          return (
            <>
              <CardCustomHeader
                title="Achievement Rate"
                numbers={`${count.toLocaleString()}%`}
                description="Displays goal achievement progress"
              />
              {/* <div className="overflow-x-auto" style={{ width }}> */}
              <BarChart
                width={width}
                height={chartHeight}
                data={data}
                margin={{
                  top: 30,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: chartColorHoverBackground }} />
                <Legend formatter={legendFormatter} />
                <Brush dataKey="name" height={20} stroke={chartColorPrimary} />
                <Bar
                  dataKey="goal"
                  fill={chartColorPrimary}
                  activeBar={
                    <Rectangle
                      fill={chartColorPrimary}
                      stroke={chartColorPrimary}
                    />
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
              {/* </div> */}
            </>
          );
        }}
      </ChartContainer>
    </ResponsiveContainer>
  );
}

export default OverviewAchievementRate;
