import dynamic from 'next/dynamic';

const QuizQuizzesRankedChild = dynamic(() => import('./_children'), {
  ssr: false,
});

const QuizQuizzesRanked = () => {
  return <QuizQuizzesRankedChild />;
};

export default QuizQuizzesRanked;

// import { getQuizRankByIncorrectAnswer } from '@/app/actions/dashboard/quiz/action';
// import QuizQuizzesRankedChild from './_children';
// import { use } from 'react';
// import { getSearchParamsForAction } from '@/lib/params';

// const QuizQuizzesRanked = ({ params }: { params: { campaign: string } }) => {
//   const searchParams = use(getSearchParamsForAction(params));
//   const data = use(getQuizRankByIncorrectAnswer(searchParams));

//   return <QuizQuizzesRankedChild data={data} />;
// };

// export default QuizQuizzesRanked;
