/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
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
} from "recharts";
import CardCustomHeader from "../../../_components/charts/chart-header";
import { useOverviewContext } from "../../_provider/provider";
import { useEffect, useState } from "react";
import { fetchData } from "../../../_lib/fetch";
import ChartContainer from "../../../_components/charts/chart-container";
import { chartHeight } from "../../../_lib/chart-variable";
import {
  chartColorHoverBackground,
  chartColorPrimary,
  chartColorSecondary,
} from "../../../_lib/chart-colors";

const COLORS = [chartColorPrimary, chartColorSecondary];

const OverviewExperts = () => {
  const { state } = useOverviewContext();
  const [data, setData] = useState({ pie: [], bar: [] });
  const [count, setCount] = useState([]);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(state.fieldValues, "overview/statistics/experts", (data) => {
        setData(data.result);
      });
      //
      fetchData(state.fieldValues, "overview/info/experts", (data) => {
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
                title="Experts"
                numbers={count.toLocaleString()}
                description="Number of people completed"
              />
              <div className="flex" style={{ width }}>
                <PieChart width={width / 2} height={chartHeight}>
                  <Pie
                    data={data.pie}
                    innerRadius={50}
                    outerRadius={120}
                    fill={chartColorPrimary}
                    dataKey="value"
                    label={({ name, value }) =>
                      `${
                        name === "expert" ? "Expert" : "Expert + Advanced"
                      }: ${value}`
                    } // 각 영역에 Label 추가
                  >
                    {data.pie.map(
                      (
                        entry: { name: string; value: number },
                        index: number
                      ) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          name={
                            entry.name === "expert"
                              ? "Expert"
                              : "Expert + Advanced"
                          }
                        />
                      )
                    )}
                  </Pie>
                  <>
                    <text
                      x="50%"
                      y="47%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-bold text-size-20px opacity-90"
                    >
                      {count}
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
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
                <div className="flex items-center flex-col">
                  <div className="text-size-14px text-zinc-950 font-semibold">
                    Experts distribution
                  </div>
                  <BarChart
                    title="Experts distribution"
                    width={width / 2}
                    height={chartHeight}
                    data={data.bar}
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
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={renderCustomTick}
                    />
                    <Tooltip cursor={{ fill: chartColorHoverBackground }} />
                    <Legend />
                    <Bar
                      dataKey="expert"
                      name="Expert"
                      stackId="a"
                      fill={chartColorPrimary}
                    >
                      <LabelList
                        dataKey="expert"
                        name="Expert"
                        content={renderLabelContent}
                      />
                    </Bar>
                    <Bar
                      dataKey="advanced"
                      name="Expert + Advanced"
                      stackId="a"
                      fill={chartColorSecondary}
                    >
                      <LabelList
                        dataKey="advanced"
                        name="Expert + Advanced"
                        content={renderLabelContent}
                      />
                    </Bar>
                  </BarChart>
                </div>
              </div>
            </>
          );
        }}
      </ChartContainer>
    </ResponsiveContainer>
  );
};

export default OverviewExperts;

const renderLabelContent = (props: any) => {
  if (props.value === 0) return;
  //
  const { x, y, width, value } = props;
  const padding = 12;
  return (
    <text
      x={x + width - padding}
      y={y + padding}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
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
