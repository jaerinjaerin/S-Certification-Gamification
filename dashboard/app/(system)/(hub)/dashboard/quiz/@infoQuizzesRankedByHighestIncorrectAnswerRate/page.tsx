import dynamic from 'next/dynamic';

const QuizQuizzesRankedChild = dynamic(() => import('./_children'), {
  ssr: false,
});

const QuizQuizzesRanked = () => {
  return <QuizQuizzesRankedChild />;
};

export default QuizQuizzesRanked;
