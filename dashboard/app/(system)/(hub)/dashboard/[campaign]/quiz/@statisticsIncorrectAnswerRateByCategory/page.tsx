import dynamic from 'next/dynamic';

const QuizIncorrectAnswerRateChild = dynamic(() => import('./_children'), {
  ssr: false,
});

const QuizIncorrectAnswerRate = () => {
  return <QuizIncorrectAnswerRateChild />;
};

export default QuizIncorrectAnswerRate;

// import { getQuizRankByCategory } from '@/app/actions/dashboard/quiz/action';
// import QuizIncorrectAnswerRateChild from './_children';
// import { use } from 'react';
// import { getSearchParamsForAction } from '@/lib/params';

// const QuizIncorrectAnswerRate = ({
//   params,
// }: {
//   params: { campaign: string };
// }) => {
//   const searchParams = use(getSearchParamsForAction(params));
//   const data = use(getQuizRankByCategory(searchParams));

//   return <QuizIncorrectAnswerRateChild data={data} />;
// };

// export default QuizIncorrectAnswerRate;
