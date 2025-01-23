/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useQuizContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";
import { ResponsiveContainer } from "recharts";
import ChartContainer from "../../../_components/charts/chart-container";
import CardCustomHeader from "../../../_components/charts/chart-header";
import { DefaultHeatMapDatum, ResponsiveHeatMapCanvas } from "@nivo/heatmap";
import { LoaderWithBackground } from "@/components/loader";
import { useModal } from "@/components/provider/modal-provider";
import DetailIncorrectTable from "./_components/detail-table";

const QuizIncorrectAnswerRate = () => {
  const { state } = useQuizContext();
  const { setContent } = useModal();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "quiz/statistics/incorrect-answer-rate-by-category",
        (data) => {
          setData(data.result || []);
          setLoading(false);
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
              {loading && <LoaderWithBackground />}
              <CardCustomHeader
                title="Incorrect answer rate by category"
                description="The darker the color, the more incorrect answers there were for that question type."
              />
              <div
                style={{ width: width, height: width / 2 }}
                className="px-10"
              >
                <ResponsiveHeatMapCanvas
                  data={data}
                  margin={{ top: 20, right: 120, bottom: 60, left: 120 }}
                  valueFormat=">-.2s"
                  theme={{
                    labels: {
                      text: {
                        fontSize: 14,
                      },
                    },
                    axis: {
                      ticks: {
                        text: {
                          fontSize: 16,
                          fontWeight: 500,
                          fill: "#09090B",
                        },
                      },
                      legend: {
                        text: {
                          fontSize: 16,
                          fontWeight: 600,
                          fill: "#09090B",
                        },
                      },
                    },
                  }}
                  onClick={(props) => {
                    const data = props.data as DefaultHeatMapDatum & {
                      meta: { questionIds: string[] };
                    };
                    const questionIds = JSON.stringify(data.meta.questionIds);
                    const category = props.serieId;
                    const group = props.data.x;

                    setContent(
                      <DetailIncorrectTable
                        category={category}
                        group={group}
                        questionIds={questionIds}
                      />
                    );
                  }}
                  axisTop={null}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 15,
                    legend: "User Group",
                    legendPosition: "middle",
                    legendOffset: 50,
                    truncateTickAt: 0,
                  }}
                  axisRight={null}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 15,
                    tickRotation: -45,
                    legend: "Category",
                    legendPosition: "middle",
                    legendOffset: -100,
                    truncateTickAt: 0,
                  }}
                  colors={{
                    type: "diverging",
                    scheme: "yellow_green_blue",
                  }}
                  labelTextColor={(cell) => {
                    // RGB 값을 가져옴 (예: "rgb(255, 0, 0)")
                    const color = cell.color || "#000000";

                    // 색상 밝기 계산 (YIQ 공식)
                    const [r, g, b] = color
                      .replace(/^rgba?\(|\s+|\)$/g, "")
                      .split(",")
                      .map(Number);
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

                    // 밝기가 낮으면 흰색, 높으면 검정색
                    return brightness > 128 ? "#000000" : "#ffffff";
                  }}
                  legends={[
                    {
                      anchor: "right",
                      translateX: 50,
                      translateY: 0,
                      length: width / 2 - 80,
                      thickness: 24,
                      direction: "column",
                      tickPosition: "after",
                      tickSize: 3,
                      tickSpacing: 4,
                      tickOverlap: false,
                      tickFormat: ">-.2s",
                      titleAlign: "start",
                      titleOffset: 4,
                    },
                  ]}
                />
              </div>
            </>
          );
        }}
      </ChartContainer>
    </ResponsiveContainer>
  );
};

export default QuizIncorrectAnswerRate;
