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
import { legendCapitalizeFormatter } from "../../../_lib/text";
import { chartHeight } from "../../../_lib/chart-variable";
import { LoaderWithBackground } from "@/components/loader";

function OverviewAchievementRate() {
  const { state } = useOverviewContext();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "overview/statistics/achievement",
        (data) => {
          setData(data.result);
          setLoading(false);
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
              {loading && <LoaderWithBackground />}
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
