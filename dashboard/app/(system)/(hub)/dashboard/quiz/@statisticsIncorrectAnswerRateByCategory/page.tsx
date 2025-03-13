import dynamic from 'next/dynamic';

const QuizIncorrectAnswerRateChild = dynamic(() => import('./_children'), {
  ssr: false,
});

const QuizIncorrectAnswerRate = () => {
  return <QuizIncorrectAnswerRateChild />;
};

export default QuizIncorrectAnswerRate;
