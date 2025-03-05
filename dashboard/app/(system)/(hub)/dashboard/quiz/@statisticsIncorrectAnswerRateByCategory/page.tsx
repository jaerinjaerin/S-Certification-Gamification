'use client';
import { useQuizContext } from '../_provider/provider';
import ChartContainer from '@/components/system/chart-container';
import CardCustomHeader from '@/components/system/chart-header';
import { DefaultHeatMapDatum, ResponsiveHeatMapCanvas } from '@nivo/heatmap';
import { LoaderWithBackground } from '@/components/loader';
import { useModal } from '@/components/provider/modal-provider';
import DetailIncorrectTable from './_components/detail-table';
import useSWR from 'swr';
import { useStateVariables } from '@/components/provider/state-provider';
import { getQuizRankByCategory } from '@/app/actions/dashboard/quiz/action';

const QuizIncorrectAnswerRate = () => {
  const { campaign } = useStateVariables();
  const { state } = useQuizContext();
  const { data: incorrects, isLoading: loading } = useSWR(
    {
      key: 'getQuizRankByCategory',
      ...state.fieldValues,
      campaign: campaign?.id,
    },
    getQuizRankByCategory
  );
  const data = incorrects || [];
  // const { data: incorrects, isLoading: loading } = useSWR(
  //   `/api/dashboard/quiz/statistics/incorrect-answer-rate-by-category?${searchParamsToQuery({ ...state.fieldValues, campaign: campaign?.id })}`,
  //   swrFetcher
  // );
  // const { result: data } = incorrects || { result: [] };
  const { setContent } = useModal();

  return (
    <ChartContainer>
      {loading && <LoaderWithBackground />}
      <CardCustomHeader
        title="Incorrect answer rate by category"
        description="The darker the color, the more incorrect answers there were for that question type."
      />
      <div className="w-full h-[30rem] px-10 cursor-pointer">
        <ResponsiveHeatMapCanvas
          data={data}
          margin={{ top: 20, right: 120, bottom: 60, left: 120 }}
          valueFormat="^-02.0f"
          theme={{
            labels: {
              text: {
                fontSize: 14,
              },
            },
            axis: {
              ticks: {
                line: { stroke: 'transparent' },
                text: {
                  fontSize: 11,
                  fontWeight: 700,
                  fill: '#09090B',
                },
              },
              legend: {
                text: {
                  fontSize: 16,
                  fontWeight: 600,
                  fill: '#09090B',
                },
              },
            },
          }}
          onClick={(props) => {
            const data = props.data as DefaultHeatMapDatum & {
              meta: { questions: QuizRankedIncorrectAnswerRateProps[] };
            };
            const questions = data.meta.questions;
            const category = props.serieId;
            const group = props.data.x;

            setContent(
              <DetailIncorrectTable
                category={category}
                group={group}
                questions={questions}
              />
            );
          }}
          axisTop={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            legend: 'User Group',
            legendPosition: 'middle',
            legendOffset: 50,
            truncateTickAt: 0,
          }}
          axisRight={null}
          axisLeft={{
            tickSize: 0,
            tickRotation: -45,
            legend: 'Category',
            legendPosition: 'middle',
            legendOffset: -100,
            truncateTickAt: 0,
          }}
          colors={{
            type: 'diverging',
            scheme: 'yellow_green_blue',
          }}
          tooltip={({ cell: { value, id, color } }) => {
            return (
              <div className="flex items-center space-x-2 p-3 rounded-xl shadow-md bg-white/90">
                <span
                  className="flex items-center flex-row size-3 rounded-full border border-zinc-500"
                  style={{ backgroundColor: color }}
                />
                <strong>{`${id.replace('.', ' / ')} : `}</strong>
                <strong>{`${value?.toLocaleString()}%`}</strong>
              </div>
            );
          }}
          labelTextColor={(cell) => {
            const color = cell.color || '#000000';

            const [r, g, b] = color
              .replace(/^rgba?\(|\s+|\)$/g, '')
              .split(',')
              .map(Number);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            return brightness > 128 ? '#000000' : '#ffffff';
          }}
          legends={[
            {
              anchor: 'right',
              translateX: 40,
              translateY: 0,
              length: 400,
              thickness: 24,
              direction: 'column',
              tickPosition: 'after',
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              tickFormat: '>-.2s',
              titleAlign: 'start',
              titleOffset: 4,
            },
          ]}
        />
      </div>
    </ChartContainer>
  );
};

export default QuizIncorrectAnswerRate;
