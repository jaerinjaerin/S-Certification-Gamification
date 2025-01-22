"use client";
import { useEffect, useState } from "react";
import { useQuizContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";
import { ResponsiveContainer } from "recharts";
import ChartContainer from "../../../_components/charts/chart-container";
import CardCustomHeader from "../../../_components/charts/chart-header";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { LoaderWithBackground } from "@/components/loader";

const QuizIncorrectAnswerRate = () => {
  const { state } = useQuizContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "quiz/statistics/incorrect-answer-rate-by-category",
        (data) => {
          console.log(data.result);

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
              <div style={{ width, height: width / 2 }}>
                <ResponsiveHeatMap
                  data={data}
                  margin={{ top: 20, right: 120, bottom: 60, left: 120 }}
                  valueFormat=">-.2s"
                  axisTop={null}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 5,
                    legend: "User Group",
                    legendPosition: "middle",
                    legendOffset: 50,
                    truncateTickAt: 0,
                  }}
                  axisRight={null}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Category",
                    legendPosition: "middle",
                    legendOffset: -90,
                    truncateTickAt: 0,
                  }}
                  colors={{
                    type: "sequential",
                    scheme: "blues",
                  }}
                  emptyColor="#555555"
                  legends={[
                    {
                      anchor: "right",
                      translateX: 60,
                      translateY: 0,
                      length: width / 2 - 80,
                      thickness: 30,
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
